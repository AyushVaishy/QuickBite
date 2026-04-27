const prisma = require('../config/prisma');

// Haversine formula — returns distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseIntent(message) {
  const lower = message.toLowerCase();
  const intent = {
    cuisines: [],
    maxCost: null,
    minRating: null,
    isVeg: null,
    mood: null,
    keywords: [],
  };

  const CUISINES = [
    'pizza','biryani','burger','chinese','south indian','north indian','dessert','cake',
    'coffee','sandwich','pasta','sushi','roll','momos','noodles','thali','dosa','idli',
    'pav bhaji','paneer','dal','rice','chicken','mutton','fish','seafood','salad','juice',
    'shake','ice cream','waffle','paratha','maggi','wrap','frankie','chole','rajma','khichdi',
  ];
  CUISINES.forEach(c => { if (lower.includes(c)) intent.cuisines.push(c); });
  intent.keywords = [...intent.cuisines];

  // Extract taste/texture/characteristic descriptors as keywords (independent of mood)
  // This ensures "breakup + spicy" → keywords includes "spicy" even when mood=comfort
  const TASTE_KW = ['spicy','hot','fiery','sweet','crispy','grilled','fried','roasted','cheesy',
    'creamy','fresh','tangy','smoky','buttery','crunchy','light','filling','rich','mild'];
  TASTE_KW.forEach(kw => { if (lower.includes(kw) && !intent.keywords.includes(kw)) intent.keywords.push(kw); });

  // Budget: require an explicit budget keyword or currency symbol before the number
  // Handles: "under 400", "₹300", "rs 200", "max 500", "budget of 250", "300 rupees"
  const budgetMatch = lower.match(
    /(?:under|below|less than|within|upto|up to|max(?:imum)?|budget(?:\s+of)?)\s*(?:rs\.?|₹|inr)?\s*(\d+)|(?:rs\.?|₹|inr)\s*(\d+)|(\d+)\s*(?:rs\.?|rupees?|inr)/
  );
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]);
    // costForTwo in DB is in paise; multiply by 100 (rupees → paise)
    if (amount >= 50 && amount <= 5000) intent.maxCost = amount * 100;
  }
  if (lower.match(/cheap|budget|affordable|low.?cost|economical/)) {
    intent.maxCost = intent.maxCost || 20000; // ₹200 default for "cheap"
  }
  if (lower.match(/expensive|premium|luxury|high.?end/)) {
    intent.minRating = intent.minRating || 4.2;
  }

  // Dietary
  if (lower.match(/\bveg\b|vegetarian/)) intent.isVeg = true;
  if (lower.match(/non.?veg|nonveg|chicken|mutton|fish|seafood|egg/)) intent.isVeg = false;

  // Moods — use else-if so most specific match wins; breakup/emotional states first
  if (lower.match(/breakup|break.?up|heartbreak|broken heart/)) intent.mood = 'comfort';
  else if (lower.match(/sad|lonely|comfort|homesick|upset|down|depressed|miserable/)) intent.mood = 'comfort';
  else if (lower.match(/healthy|diet|fitness|low.?cal|nutritious|lean/)) intent.mood = 'healthy';
  else if (lower.match(/spicy|hot|fiery|chilli|pepper|peri.?peri/)) intent.mood = 'spicy';
  else if (lower.match(/sweet|dessert|cake|ice.?cream|chocolate|sugar/)) intent.mood = 'sweet';
  else if (lower.match(/romantic|date|anniversary|candlelight/)) intent.mood = 'romantic';
  else if (lower.match(/party|celebrate|birthday|special|occasion|gathering/)) intent.mood = 'party';
  else if (lower.match(/late.?night|midnight|night.?snack|night.?craving/)) intent.mood = 'hangover';
  else if (lower.match(/quick|fast|hurry|hungry|starving|asap/)) intent.mood = 'quick';
  else if (lower.match(/light|low.?cal|salad/)) intent.mood = 'light';

  // Rating hints
  if (lower.match(/best|top|highly.?rated|high.?rated|top.?rated|popular|4\+|five star|must try/)) {
    intent.minRating = intent.minRating || 4.0;
  }

  return intent;
}

const MOOD_CUISINES = {
  comfort:     ['biryani','dal','paratha','thali','rice','paneer','khichdi','rajma','chole','maggi'],
  healthy:     ['salad','juice','grilled','soup','idli','dosa','oats','fruit'],
  celebration: ['pizza','burger','momos','pasta','nachos','wings','combo'],
  party:       ['pizza','burger','momos','pasta','nachos','wings','combo'],
  quick:       ['burger','sandwich','wrap','roll','momos','frankie'],
  sweet:       ['cake','dessert','ice cream','waffle','shake','chocolate','kulfi','pastry'],
  spicy:       ['spicy','chilli','tandoori','pepper','schezwan','vindaloo','hot'],
  romantic:    ['pasta','italian','sushi','dessert','chocolate','cake'],
  light:       ['salad','soup','idli','dosa','sandwich','grilled','fruit'],
  hangover:    ['burger','pizza','fries','biryani','momos','maggi'],
};

const NEARBY_RADIUS_KM = 10; // consistent with main restaurant listing

async function getRecommendations(intent, lat, lng) {
  const validLocation = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
  const userLat = validLocation ? Number(lat) : null;
  const userLng = validLocation ? Number(lng) : null;

  const where = { isOpen: true, isApproved: true };
  // Sanity filter: exclude corrupt data (< ₹50) and zero-rating placeholder restaurants
  where.costForTwo = { gte: 5000 };
  where.avgRating = { gt: 0 };
  if (intent.minRating) where.avgRating = { gt: 0, gte: intent.minRating };
  // costForTwo is stored in paise in DB — compare directly with intent.maxCost (also paise)
  if (intent.maxCost) where.costForTwo = { gte: 5000, lte: intent.maxCost };

  // Bounding-box pre-filter if location is provided (faster than full-table scan)
  if (userLat && userLng) {
    const LAT_DELTA = NEARBY_RADIUS_KM / 111;
    const LNG_DELTA = NEARBY_RADIUS_KM / (111 * Math.cos(userLat * Math.PI / 180));
    where.lat = { gte: userLat - LAT_DELTA, lte: userLat + LAT_DELTA };
    where.lng = { gte: userLng - LNG_DELTA, lte: userLng + LNG_DELTA };
  }

  // De-duplicate keywords before scoring
  const keywordsToSearch = [
    ...new Set([
      ...intent.cuisines,
      ...(intent.keywords || []),
      ...(intent.mood && MOOD_CUISINES[intent.mood] ? MOOD_CUISINES[intent.mood] : []),
    ]),
  ];

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: {
      menuItems: {
        where: { isAvailable: true },
        take: 20, // increased to improve keyword matching coverage
      },
    },
    orderBy: [{ avgRating: 'desc' }, { deliveryTime: 'asc' }],
    take: 30,
  });

  let scored = restaurants.map(r => {
    let score = r.avgRating || 0;
    const rCuisines = (Array.isArray(r.cuisines) ? r.cuisines : []).map(c => c.toLowerCase());
    const rName = (r.name || '').toLowerCase();

    keywordsToSearch.forEach(kw => {
      if (rCuisines.some(c => c.includes(kw) || kw.includes(c))) score += 2;
      if (rName.includes(kw)) score += 1;
    });

    let matchingItems = r.menuItems || [];
    if (intent.isVeg !== null) {
      matchingItems = matchingItems.filter(i => i.isVeg === intent.isVeg);
    }
    if (keywordsToSearch.length > 0) {
      const kwFiltered = matchingItems.filter(i => {
        const iName = (i.name || '').toLowerCase();
        const iCat = (i.category || '').toLowerCase();
        return keywordsToSearch.some(kw => iName.includes(kw) || iCat.includes(kw));
      });
      score += kwFiltered.length * 0.5; // bonus per matching menu item
      if (kwFiltered.length > 0) matchingItems = kwFiltered;
    }

    // Distance scoring: closer = higher score (up to +1.5 bonus at 0 km)
    let distance = null;
    if (userLat && userLng && r.lat && r.lng) {
      distance = haversineKm(userLat, userLng, r.lat, r.lng);
      score += Math.max(0, 1.5 - distance / (NEARBY_RADIUS_KM / 1.5));
    }

    return { restaurant: r, score, matchingItems: matchingItems.slice(0, 3), distance };
  });

  // Prefer restaurants that got at least one keyword bonus (score > raw avgRating)
  if (keywordsToSearch.length > 0) {
    const withBonus = scored.filter(s => s.score > (s.restaurant.avgRating || 0));
    if (withBonus.length >= 2) scored = withBonus;
  }

  // When isVeg is explicit, drop restaurants with no qualifying items
  if (intent.isVeg !== null) {
    const withItems = scored.filter(s => s.matchingItems.length > 0);
    if (withItems.length >= 2) scored = withItems;
  }

  scored.sort((a, b) => b.score - a.score);

  // Fallback: if filters produced nothing, return top-rated open restaurants
  if (scored.length === 0) {
    const fallback = await prisma.restaurant.findMany({
      where: { isOpen: true, isApproved: true, costForTwo: { gte: 5000 }, avgRating: { gt: 0 } },
      include: {
        menuItems: { where: { isAvailable: true }, take: 3 },
      },
      orderBy: [{ avgRating: 'desc' }],
      take: 5,
    });
    return fallback.map(r => ({
      id: r.id,
      name: r.name,
      rating: r.avgRating,
      deliveryTime: r.deliveryTime,
      costForTwo: r.costForTwo, // already in paise
      cuisines: r.cuisines,
      imageUrl: r.imageUrl,
      distance: null,
      isFallback: true,
      dishes: (r.menuItems || []).slice(0, 3).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price, // already in paise
        isVeg: i.isVeg,
      })),
    }));
  }

  return scored.slice(0, 5).map(({ restaurant: r, matchingItems, distance }) => ({
    id: r.id,
    name: r.name,
    rating: r.avgRating,
    deliveryTime: r.deliveryTime,
    costForTwo: r.costForTwo, // already in paise — no conversion needed
    cuisines: r.cuisines,
    imageUrl: r.imageUrl,
    distance: distance !== null ? Math.round(distance * 10) / 10 : null,
    dishes: matchingItems.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price, // already in paise
      isVeg: i.isVeg,
    })),
  }));
}

module.exports = { parseIntent, getRecommendations };

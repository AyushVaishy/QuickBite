const prisma = require('../config/prisma');

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

  const CUISINES = ['pizza','biryani','burger','chinese','south indian','north indian','dessert','cake','coffee','sandwich','pasta','sushi','roll','momos','noodles','thali','dosa','idli','pav bhaji','paneer','dal','rice','chicken','mutton','fish','seafood','salad','juice','shake','ice cream','waffle','paratha'];
  CUISINES.forEach(c => { if (lower.includes(c)) intent.cuisines.push(c); });
  intent.keywords = [...intent.cuisines];

  const budgetMatch = lower.match(/(?:under|below|less than|within|upto|up to|₹|rs\.?|inr)?\s*(\d+)/);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]);
    if (amount >= 50 && amount <= 5000) intent.maxCost = amount * 100;
  }
  if (lower.match(/cheap|budget|affordable|low.?cost|economical/)) intent.maxCost = intent.maxCost || 20000;
  if (lower.match(/expensive|premium|luxury|high.?end/)) intent.minRating = intent.minRating || 4.2;

  if (lower.match(/\bveg\b|vegetarian/)) intent.isVeg = true;
  if (lower.match(/non.?veg|nonveg|chicken|mutton|fish|seafood|egg/)) intent.isVeg = false;

  if (lower.match(/sad|lonely|comfort|homesick|upset|down/)) intent.mood = 'comfort';
  if (lower.match(/healthy|diet|fitness|light|low.?cal|salad/)) intent.mood = 'healthy';
  if (lower.match(/party|celebrate|birthday|special|occasion/)) intent.mood = 'party';
  if (lower.match(/quick|fast|hurry|hungry|starving|asap/)) intent.mood = 'quick';
  if (lower.match(/sweet|dessert|cake|ice.?cream|chocolate/)) intent.mood = 'sweet';

  if (lower.match(/best|top|highly rated|popular|4\+|five star/)) intent.minRating = intent.minRating || 4.0;

  return intent;
}

const MOOD_CUISINES = {
  comfort: ['biryani','dal','paratha','thali','rice','paneer'],
  healthy: ['salad','juice','grilled','soup','idli','dosa'],
  party: ['pizza','burger','momos','rolls','pasta','nachos'],
  quick: ['burger','sandwich','wrap','roll','momos'],
  sweet: ['cake','dessert','ice cream','waffle','shake','chocolate'],
};

async function getRecommendations(intent) {
  const where = { isOpen: true, isApproved: true };

  if (intent.minRating) where.avgRating = { gte: intent.minRating };
  // costForTwo is stored in rupees; intent.maxCost is in paise, so divide by 100 for comparison
  if (intent.maxCost) where.costForTwo = { lte: Math.round(intent.maxCost / 100) * 2 };

  const keywordsToSearch = [...intent.cuisines];
  if (intent.mood && MOOD_CUISINES[intent.mood]) {
    keywordsToSearch.push(...MOOD_CUISINES[intent.mood]);
  }

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: {
      menuItems: {
        where: { isAvailable: true },
        take: 10,
        orderBy: { price: 'asc' },
      },
    },
    orderBy: [{ avgRating: 'desc' }, { deliveryTime: 'asc' }],
    take: 20,
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
      if (kwFiltered.length > 0) matchingItems = kwFiltered;
    }

    return { restaurant: r, score, matchingItems: matchingItems.slice(0, 3) };
  });

  scored.sort((a, b) => b.score - a.score);

  if (keywordsToSearch.length > 0 && scored.length > 0) {
    const baselineScore = scored[0].restaurant.avgRating || 0;
    const filtered = scored.filter(s => s.score > baselineScore);
    if (filtered.length >= 2) scored = filtered;
  }

  return scored.slice(0, 4).map(({ restaurant: r, matchingItems }) => ({
    id: r.id,
    name: r.name,
    rating: r.avgRating,
    deliveryTime: r.deliveryTime,
    costForTwo: r.costForTwo * 100, // convert rupees → paise for consistent frontend display
    cuisines: r.cuisines,
    imageUrl: r.imageUrl,
    dishes: matchingItems.map(i => ({
      name: i.name,
      price: i.price, // already in paise
      isVeg: i.isVeg,
    })),
  }));
}

module.exports = { parseIntent, getRecommendations };

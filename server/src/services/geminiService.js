const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
}

/**
 * Use Gemini to extract structured food ordering intent from a natural language message.
 * Returns an intent object — gracefully handles malformed JSON.
 */
async function extractIntent(userMessage) {
  const m = getModel();

  const prompt = `Extract food ordering intent from the user message below and return ONLY a valid JSON object (no markdown, no explanation, no code blocks).

User message: "${userMessage.replace(/"/g, "'")}"

Return EXACTLY this JSON structure:
{
  "cuisines": [],
  "maxCost": null,
  "minRating": null,
  "isVeg": null,
  "mood": null,
  "keywords": []
}

Rules:
- cuisines: array of specific food types or cuisines mentioned (e.g. ["biryani", "pizza", "spicy food", "chinese"])
- maxCost: number in RUPEES if a budget/price limit is mentioned (e.g. "under 300" → 300, "below 200" → 200), else null
- minRating: minimum rating number if quality is mentioned (e.g. "best" → 4.0, "highly rated" → 4.2, "high rated" → 4.0, "top rated" → 4.2, "top restaurants" → 4.0, "popular" → 4.0), else null
  - isVeg: true if user says veg/vegetarian, false if non-veg/chicken/mutton/fish, null if unspecified
- mood: one of ["comfort","healthy","party","quick","sweet","spicy","romantic","celebration","light","hangover"] based on context — emotional cues count:
    breakup/sad/upset/lonely → "comfort"
    healthy/diet/light/low-cal/fit → "healthy"  
    party/birthday/celebration → "celebration"
    date/romantic → "romantic"
    spicy/hot/fiery → "spicy"
    sweet/dessert/chocolate → "sweet"
    quick/hungry/fast → "quick"
    late night/midnight/night snack → "hangover"
  null if none applies
- keywords: array of food characteristic words mentioned (e.g. ["spicy", "light", "crispy", "grilled", "cheese"])
  IMPORTANT: Always include taste/texture descriptors in keywords even if mood is set (e.g. "breakup spicy" → mood:"comfort", keywords:["spicy"])`;

  const result = await m.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini returned no JSON for intent extraction');

  const parsed = JSON.parse(jsonMatch[0]);

  // Normalise: maxCost should be in paise (multiply rupees × 100) for internal use
  return {
    cuisines:   Array.isArray(parsed.cuisines)  ? parsed.cuisines  : [],
    maxCost:    parsed.maxCost   ? Math.round(parsed.maxCost) * 100 : null, // → paise
    minRating:  parsed.minRating ? Number(parsed.minRating)         : null,
    isVeg:      parsed.isVeg !== undefined ? parsed.isVeg           : null,
    mood:       parsed.mood      || null,
    keywords:   Array.isArray(parsed.keywords)  ? parsed.keywords  : [],
  };
}

/**
 * Generate a warm, conversational AI response.
 * Receives the original message + resolved intent + restaurant results.
 */
async function generateFoodResponse(userMessage, intent, restaurants) {
  const m = getModel();

  const restaurantSummary = restaurants.length === 0
    ? 'No matching restaurants found.'
    : restaurants.map((r, i) =>
        `${i + 1}. ${r.name} (Rating: ${r.rating?.toFixed(1) ?? 'N/A'}, ` +
        `Delivery: ${r.deliveryTime ?? '?'} min, ` +
        `Cost for 2: ₹${r.costForTwo ? Math.round(r.costForTwo / 100) : '?'}) — ` +
        `Dishes: ${r.dishes.map(d => d.name).join(', ') || 'various'}`
      ).join('\n');

  const intentSummary = [
    intent.mood                    ? `Mood/context: ${intent.mood}`            : null,
    intent.cuisines?.length        ? `Craving: ${intent.cuisines.join(', ')}`  : null,
    intent.keywords?.length        ? `Preferences: ${intent.keywords.join(', ')}` : null,
    intent.maxCost                 ? `Budget: ₹${Math.round(intent.maxCost / 100)}` : null,
    intent.isVeg === true          ? 'Vegetarian'                              : null,
    intent.isVeg === false         ? 'Non-vegetarian'                          : null,
  ].filter(Boolean).join(' | ');

  const prompt = `You are QuickBite's empathetic AI food assistant. A user sent this message:
"${userMessage}"

Understood intent: ${intentSummary || 'general food query'}

Matching restaurants from our database:
${restaurantSummary}

Write a short, warm reply (2-3 sentences MAX) that:
- Acknowledges their emotional state or craving naturally and empathetically
- Highlights 1-2 restaurants from the list by name
- Ends with a small encouraging note
- Uses 1-2 fitting emojis
- NEVER makes up restaurant names or dishes — only use what's in the list
- If no restaurants found, suggest browsing all restaurants or relaxing filters

Keep it under 80 words. Tone: friendly, caring, like a food-loving friend.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  return text?.trim() || null;
}

module.exports = { extractIntent, generateFoodResponse };

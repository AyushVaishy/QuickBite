const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

/**
 * Generate a conversational AI response for the food assistant.
 * Receives the user message + structured restaurant results from the DB.
 * Returns a friendly, personalized message string.
 */
async function generateFoodResponse(userMessage, intent, restaurants) {
  const m = getModel();

  const restaurantSummary = restaurants.length === 0
    ? 'No restaurants matched the filters.'
    : restaurants.map((r, i) =>
        `${i + 1}. ${r.name} (Rating: ${r.rating?.toFixed(1) ?? 'N/A'}, ` +
        `Delivery: ${r.deliveryTime ?? '?'} min, ` +
        `Cost for 2: ₹${r.costForTwo ? Math.round(r.costForTwo / 100) : '?'}) — ` +
        `Dishes: ${r.dishes.map(d => d.name).join(', ') || 'various'}`
      ).join('\n');

  const intentSummary = [
    intent.mood     ? `Mood: ${intent.mood}`               : null,
    intent.cuisines?.length ? `Craving: ${intent.cuisines.join(', ')}` : null,
    intent.maxCost  ? `Budget: under ₹${intent.maxCost}`   : null,
    intent.isVeg === true  ? 'Dietary: vegetarian'         : null,
    intent.isVeg === false ? 'Dietary: non-vegetarian'     : null,
  ].filter(Boolean).join(', ');

  const prompt = `You are QuickBite's friendly AI food assistant. A user sent this message:
"${userMessage}"

Detected intent: ${intentSummary || 'general food query'}

Restaurants found from our database:
${restaurantSummary}

Write a short, warm, conversational reply (2-3 sentences max) that:
- Acknowledges their mood/craving naturally
- Mentions 1-2 of the top restaurant names from the list
- Ends with a light encouraging note
- Uses 1-2 relevant emojis
- Does NOT make up details — only use what's in the restaurant list above
- If no restaurants found, suggest they try browsing all restaurants or adjusting filters

Keep it under 80 words. Be friendly, not corporate.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  return text?.trim() || null;
}

module.exports = { generateFoodResponse };

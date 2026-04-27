const { parseIntent, getRecommendations } = require('../services/recommendationService');
const { buildMessage } = require('../services/promptBuilder');
const { extractIntent, generateFoodResponse } = require('../services/geminiService');

const chat = async (req, res) => {
  try {
    const { message, lat, lng } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmed = message.trim().slice(0, 500);

    // Step 1: Extract intent — try Gemini first (understands emotions/context),
    // fall back to regex parseIntent if Gemini is unavailable
    let intent;
    try {
      intent = await extractIntent(trimmed);
    } catch (intentErr) {
      console.warn('Gemini intent extraction failed, using regex fallback:', intentErr.message);
      intent = parseIntent(trimmed);
    }

    // Step 2: Query DB using structured intent
    const restaurants = await getRecommendations(intent, lat || null, lng || null);

    // Step 3: Generate response — try Gemini, fall back to template
    let responseMessage;
    try {
      responseMessage = await generateFoodResponse(trimmed, intent, restaurants);
    } catch (responseErr) {
      console.warn('Gemini response generation failed, using fallback:', responseErr.message);
      responseMessage = null;
    }
    if (!responseMessage) {
      responseMessage = buildMessage(intent, restaurants);
    }

    return res.json({
      message: responseMessage,
      restaurants,
      intent: {
        cuisines: intent.cuisines,
        mood: intent.mood,
        keywords: intent.keywords,
        isVeg: intent.isVeg,
        maxCost: intent.maxCost ? Math.round(intent.maxCost / 100) : null,
      },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({ error: 'AI assistant is unavailable. Please try again.' });
  }
};

module.exports = { chat };

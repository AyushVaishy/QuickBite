const { parseIntent, getRecommendations } = require('../services/recommendationService');
const { buildMessage } = require('../services/promptBuilder');

const chat = async (req, res) => {
  try {
    const { message, lat, lng } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmed = message.trim().slice(0, 500);
    const intent = parseIntent(trimmed);
    const restaurants = await getRecommendations(intent, lat || null, lng || null);
    const responseMessage = buildMessage(intent, restaurants);

    return res.json({
      message: responseMessage,
      restaurants,
      intent: {
        cuisines: intent.cuisines,
        mood: intent.mood,
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

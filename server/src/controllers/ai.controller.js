const { parseIntent, getRecommendations } = require('../services/recommendationService');
const { buildMessage } = require('../services/promptBuilder');
const { extractIntent, generateFoodResponse } = require('../services/geminiService');
const { conversationalChat } = require('../services/conversationalAIService');

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


const converse = async (req, res) => {
  try {
    const { messages, userName, savedAddress, lat, lng, shownRestaurants, userLanguage } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Sanitize and limit message history (keep last 20 turns max)
    const clean = messages
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: typeof m.content === 'string' ? m.content.slice(0, 500) : '',
      }))
      .filter(m => m.content)
      .slice(-20);

    if (clean.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    // Sanitize shownRestaurants — only pass id, name, dishes (id, name, price, isVeg)
    const cleanRestaurants = Array.isArray(shownRestaurants)
      ? shownRestaurants.slice(0, 10).map(r => ({
          id: String(r.id || ''),
          name: String(r.name || ''),
          dishes: Array.isArray(r.dishes)
            ? r.dishes.slice(0, 10).map(d => ({
                id: String(d.id || ''),
                name: String(d.name || ''),
                price: Number(d.price) || 0,
                isVeg: Boolean(d.isVeg),
              }))
            : [],
        }))
      : [];

    let result;
    try {
      result = await conversationalChat({
        messages: clean,
        userName: typeof userName === 'string' ? userName.slice(0, 50) : '',
        savedAddress: typeof savedAddress === 'string' ? savedAddress.slice(0, 200) : '',
        shownRestaurants: cleanRestaurants,
        userLanguage: userLanguage === 'hi' ? 'hi' : 'en',
      });
    } catch (geminiErr) {
      console.warn('Conversational AI error, using fallback:', geminiErr.message);
      const isQuota = String(geminiErr.message).includes('429') || String(geminiErr.message).includes('quota');
      const reply = isQuota
        ? "Priya's brain is taking a short break 🧠💤 Our AI quota is temporarily exhausted. Please try again in a few minutes!"
        : "I had a little hiccup! 😅 Could you say that again?";
      result = { action: 'NONE', reply };
    }

    // RECOMMEND: fetch restaurants from DB
    if (result.action === 'RECOMMEND' && result.intent) {
      const intent = {
        cuisines: Array.isArray(result.intent.cuisines) ? result.intent.cuisines : [],
        mood: result.intent.mood || null,
        maxCost: result.intent.maxCost ? Math.round(Number(result.intent.maxCost)) * 100 : null,
        isVeg: result.intent.isVeg !== undefined ? result.intent.isVeg : null,
        keywords: Array.isArray(result.intent.keywords) ? result.intent.keywords : [],
        minRating: result.intent.minRating || null,
      };
      const restaurants = await getRecommendations(intent, lat || null, lng || null);
      return res.json({ action: 'RECOMMEND', reply: result.reply, restaurants });
    }

    // ADD_TO_CART / PLACE_ORDER / NONE — pass straight to client
    return res.json(result);
  } catch (err) {
    console.error('Converse error:', err);
    return res.json({ action: 'NONE', reply: "Sorry, I'm having a moment! Could you try again? 😊" });
  }
};

module.exports = { chat, converse };

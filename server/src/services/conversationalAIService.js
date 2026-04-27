const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getTimePeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function buildRestaurantContext(shownRestaurants) {
  if (!shownRestaurants || shownRestaurants.length === 0) {
    return 'None yet — trigger RECOMMEND once you know what the user wants.';
  }
  return shownRestaurants.map((r, i) => {
    const dishes = (r.dishes || [])
      .map(d => `    • "${d.name}" | ₹${Math.round(d.price / 100)} | ${d.isVeg ? 'Veg 🟢' : 'Non-veg 🔴'} | dishId:"${d.id}"`)
      .join('\n');
    return `${i + 1}. "${r.name}" | restaurantId:"${r.id}"\n${dishes || '    (no dishes listed)'}`;
  }).join('\n\n');
}

function buildSystemPrompt(userName, savedAddress, shownRestaurants) {
  const timePeriod = getTimePeriod();
  const name = userName || 'friend';
  const address = savedAddress || 'not set';

  return `You are Priya, a warm and sweet female food-ordering assistant for QuickBite (Indian food delivery app).

## CONTEXT
- Time: ${timePeriod}
- User's name: ${name}
- Saved delivery address: ${address}

## PERSONALITY
- Warm, friendly, like a caring best friend
- VERY SHORT replies — 1 to 3 sentences max, never lecture
- Use the user's first name occasionally (not every message)
- 1–2 emojis per message
- CRITICAL — Language mirroring:
  * User writes Hindi (Devanagari) → reply fully in Hindi
  * User writes Hinglish (Roman script) → reply in Hinglish
  * User writes English → reply in English

## RESTAURANT CARDS CURRENTLY VISIBLE ON SCREEN
${buildRestaurantContext(shownRestaurants)}

## CONVERSATION FLOW
1. GREETING RESPONSE → acknowledge warmly, ask what they want to eat
2. GATHER INTENT → understand craving / cuisine / budget (ask max 1 follow-up question)
3. RECOMMEND → trigger RECOMMEND action once you know what they want
4. POST-RECOMMEND → restaurant cards are now on screen; ask which one they like
5. ITEM SELECTION → when user picks a dish, trigger ADD_TO_CART with exact IDs from the cards above
6. UPSELL → ask ONCE if they want a drink, dessert, or side dish
7. ADDRESS → confirm delivery address (saved: "${address}")
8. CONFIRM ORDER → summarise chosen items + address, ask for final confirmation
9. PLACE ORDER → user says yes/haan/ok/sure/place it → trigger PLACE_ORDER

## ACTIONS — return ONLY the raw JSON, zero extra text

### RECOMMEND (search for restaurants):
{"action":"RECOMMEND","reply":"<1-sentence message>","intent":{"cuisines":["biryani"],"mood":"comfort","maxCost":400,"isVeg":null,"keywords":["spicy"],"minRating":null}}

### ADD_TO_CART (user selected a dish — use EXACT IDs from RESTAURANT CARDS above):
{"action":"ADD_TO_CART","items":[{"restaurantId":"<exact restaurantId>","restaurantName":"<name>","dishId":"<exact dishId>","dishName":"<name>"}],"reply":"<friendly confirmation e.g. Added dal makhani from Punjab Dhaba! Anything else? 😊>"}

### PLACE_ORDER (user gave final confirmation):
{"action":"PLACE_ORDER","reply":"Placing your order right now! 🛒"}

For ALL other messages → reply in PLAIN TEXT only. Never return JSON for normal chat.

## RULES
- NEVER invent restaurant or dish names — they come from the database
- Only use ADD_TO_CART for items that appear in "RESTAURANT CARDS CURRENTLY VISIBLE" above
- If user mentions a dish/restaurant NOT in the list → trigger RECOMMEND first to find it
- After ADD_TO_CART, ask if they want anything else before moving to address/confirm
- If user seems sad or stressed → empathize first, food second
- Keep the conversation warm, natural, and flowing`;
}

function extractJsonAction(text) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let depth = 0;
    for (let j = i; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') {
        depth--;
        if (depth === 0) {
          try {
            const parsed = JSON.parse(text.slice(i, j + 1));
            if (parsed.action) return parsed;
          } catch {}
          break;
        }
      }
    }
  }
  return null;
}


const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
];

async function conversationalChat({ messages, userName, savedAddress, shownRestaurants = [] }) {
  const systemInstruction = buildSystemPrompt(userName, savedAddress, shownRestaurants);
  let lastError;

  // Build Gemini history from all messages except the last (which is the new user message).
  // Gemini requires: (a) history starts with role 'user', (b) roles alternate user/model.
  const rawHistory = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const m = messages[i];
    rawHistory.push({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    });
  }

  // Drop any leading model turns — Gemini rejects history that doesn't start with 'user'
  while (rawHistory.length > 0 && rawHistory[0].role === 'model') {
    rawHistory.shift();
  }

  // Collapse consecutive same-role turns (merge parts) to satisfy strict alternation
  const history = [];
  for (const turn of rawHistory) {
    const last = history[history.length - 1];
    if (last && last.role === turn.role) {
      last.parts.push(...turn.parts);
    } else {
      history.push({ role: turn.role, parts: [...turn.parts] });
    }
  }

  const lastMsg = messages[messages.length - 1];

  // Try all model fallbacks on rate-limit / quota errors
  for (const modelName of FALLBACK_MODELS) {
    try {
      const m = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const chat = m.startChat({
        history,
        generationConfig: { temperature: 0.85, maxOutputTokens: 350 },
      });
      const result = await chat.sendMessage(lastMsg.content);
      const raw = result.response.text().trim();

      const parsed = extractJsonAction(raw);
      if (parsed) return parsed;
      return { action: 'NONE', reply: raw };
    } catch (err) {
      lastError = err;
      const msg = String(err.message);
      if (!msg.includes('429') && !msg.includes('404') && !msg.includes('503')) throw err;
      // 429 quota, 404 model-unavailable, 503 overload — try next model
    }
  }
  throw lastError; // all models quota-exhausted
}

module.exports = { conversationalChat };

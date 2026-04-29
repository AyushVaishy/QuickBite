const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getTimePeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 23) return 'evening';  // evening until 11 PM
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
    return `OPTION ${i + 1}. "${r.name}" | restaurantId:"${r.id}"\n${dishes || '    (no dishes listed)'}`;
  }).join('\n\n');
}

function buildSystemPrompt(userName, savedAddress, shownRestaurants, userLanguage) {
  const timePeriod = getTimePeriod();
  const name = userName || 'friend';
  const address = savedAddress || 'not set';

  const langInstruction = userLanguage === 'hi'
    ? `LANGUAGE LOCK: The user is writing in Hindi (Devanagari script). You MUST reply ONLY in Hindi (Devanagari). Do NOT use English or Roman script at all.`
    : `LANGUAGE LOCK: The user is writing in English or Hinglish (Roman script). You MUST reply ONLY in English or Hinglish (Roman script). Do NOT use Hindi Devanagari characters at all.`;

  return `You are Priya, a warm and sweet female food-ordering assistant for Cravon (Indian food delivery app).

## CONTEXT
- Time: ${timePeriod}
- User's name: ${name}
- Saved delivery address: ${address}

## ⚠️ ${langInstruction}

## PERSONALITY
- Warm, friendly, like a caring best friend texting you
- MAX 1–2 sentences per reply — never more, never lecture
- No long intros or explanations — get straight to the point
- Use the user's first name once in a while (not every message)
- 1 emoji max per message
- Mirror the exact language of the user's last message — if they wrote English, reply English; if Devanagari Hindi, reply Hindi

## RESTAURANT CARDS CURRENTLY VISIBLE ON SCREEN
${buildRestaurantContext(shownRestaurants)}

## CONVERSATION FLOW
1. GREETING → acknowledge warmly, ask what they want to eat
2. GATHER INTENT → understand craving / cuisine / budget (1 follow-up question max)
3. RECOMMEND → trigger RECOMMEND once you know what they want
4. POST-RECOMMEND → You have the restaurant list in RESTAURANT CARDS above. Read them out verbally:
   "Found 3 spots! The Pizza Hub has Margherita and Pepperoni, Burger King has Classic Burger and Fries, Cafe Delight has Veg Burger. Which one do you want?"
   → NEVER say "tap", "click", "browse", "explore menu" — you are a VOICE assistant
5. USER PICKS RESTAURANT → find it in RESTAURANT CARDS above, read its dishes with prices:
   "From The Pizza Hub: Margherita ₹199, Pepperoni ₹249, Cold Coffee ₹89. What would you like?"
   → When user names a dish, use ADD_TO_CART with EXACT IDs from the cards
   → If the chosen restaurant doesn't have what user wants → trigger RECOMMEND again with correct cuisine
6. UPSELL → ask ONCE if they want a drink or dessert
7. ADDRESS → confirm delivery address (saved: "${address}")
8. CONFIRM ORDER → one-line summary of items + address, ask to confirm
9. PLACE ORDER → user says yes/haan/ok/sure/confirm → trigger PLACE_ORDER

## ACTIONS — return ONLY the raw JSON, zero extra text

### RECOMMEND (search for restaurants — cuisines = exact food types user asked for):
{"action":"RECOMMEND","reply":"<1-sentence message>","intent":{"cuisines":["pizza","burger"],"mood":null,"maxCost":300,"isVeg":null,"keywords":["cold drink"],"minRating":null}}

### ADD_TO_CART (user selected a dish — use EXACT IDs from RESTAURANT CARDS above):
{"action":"ADD_TO_CART","items":[{"restaurantId":"<exact restaurantId>","restaurantName":"<name>","dishId":"<exact dishId>","dishName":"<name>"}],"reply":"Added! Anything else? 😊"}

### PLACE_ORDER (user gave final confirmation):
{"action":"PLACE_ORDER","reply":"Placing your order! 🛒"}

For ALL other messages → reply in PLAIN TEXT only. Never return JSON for normal chat.

## RULES
- 🚫 NEVER say "tap", "click", "browse", "explore", "check the menu", "see their menu", "explore the menu", "there might be options" — VOICE ONLY
- 🚫 NEVER make up restaurant or dish names — use ONLY what's in RESTAURANT CARDS above
- 🚫 NEVER say "I don't have the exact menu" — you DO have it above; just read it
- ✅ User says "the first one" / "option 1" / "number 1" → that is OPTION 1 in the restaurant cards
- ✅ After user picks a restaurant: read its EXACT dishes + prices from the cards, ask what they want
- ✅ After RECOMMEND: read out restaurant names + 1–2 dishes each → ask which they prefer
- ✅ If dishes in current cards don't match what user wants → trigger RECOMMEND again with correct cuisines
- ✅ After ADD_TO_CART: ask if they want anything else before asking for address
- Keep it warm, brief, natural`;
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

async function conversationalChat({ messages, userName, savedAddress, shownRestaurants = [], userLanguage = 'en' }) {
  const systemInstruction = buildSystemPrompt(userName, savedAddress, shownRestaurants, userLanguage);
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
        generationConfig: { temperature: 0.85, maxOutputTokens: 180 },
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

function buildMessage(intent, results) {
  if (!results || results.length === 0) {
    return "I couldn't find matching restaurants right now. Try browsing all restaurants or adjusting your preferences! 🍽️";
  }

  const parts = [];

  if (intent.mood === 'comfort') parts.push("Sending some comfort food your way — you deserve it! 🤗");
  else if (intent.mood === 'healthy') parts.push("Great choice for staying healthy! 🥗");
  else if (intent.mood === 'spicy') parts.push("Bringing the heat! 🌶️ Here are some fiery options.");
  else if (intent.mood === 'sweet') parts.push("Satisfy that sweet tooth! 🍰");
  else if (intent.mood === 'romantic') parts.push("Perfect for a special evening! 🌹");
  else if (intent.mood === 'party') parts.push("Let's get the party started! 🎉");
  else if (intent.mood === 'hangover') parts.push("Late night cravings sorted! 🌙");
  else if (intent.mood === 'quick') parts.push("Quick bites for when you're in a hurry! ⚡");
  else if (intent.mood === 'light') parts.push("Light and delicious options just for you! 🌿");
  else if (intent.minRating) parts.push("Top-rated picks just for you! ⭐");
  else parts.push("Here are some great options for you! 😋");

  if (results.some(r => r.isFallback)) {
    parts.push("These are our most popular restaurants right now.");
  }
  if (intent.maxCost) {
    parts.push(`Budget-friendly picks under ₹${Math.round(intent.maxCost / 100)}.`);
  }
  if (intent.cuisines && intent.cuisines.length > 0) {
    parts.push(`Showing ${intent.cuisines.slice(0, 2).join(' & ')} options.`);
  }
  if (intent.isVeg === true) parts.push("All vegetarian options. 🌱");
  if (intent.isVeg === false) parts.push("Non-veg options included. 🍗");

  return parts.join(' ');
}

module.exports = { buildMessage };

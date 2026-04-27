function buildMessage(intent, results) {
  if (!results || results.length === 0) {
    return "I couldn't find matching restaurants right now. Try browsing all restaurants or adjust your preferences!";
  }

  const parts = [];

  if (intent.mood === 'comfort') parts.push("Comfort food coming right up! 🤗");
  else if (intent.mood === 'healthy') parts.push("Great choice for staying healthy! 🥗");
  else if (intent.mood === 'party') parts.push("Let's get the party started! 🎉");
  else if (intent.mood === 'sweet') parts.push("Satisfy that sweet tooth! 🍰");
  else if (intent.mood === 'quick') parts.push("Quick bites for when you're in a hurry! ⚡");
  else parts.push("Here are some great options for you! 😋");

  if (intent.maxCost) {
    parts.push(`Budget-friendly picks under ₹${Math.round(intent.maxCost / 100)}.`);
  }
  if (intent.cuisines.length > 0) {
    parts.push(`Showing ${intent.cuisines.slice(0, 2).join(' & ')} options.`);
  }
  if (intent.isVeg === true) parts.push("All vegetarian options. 🌱");
  if (intent.isVeg === false) parts.push("Non-veg options included. 🍗");

  return parts.join(' ');
}

module.exports = { buildMessage };

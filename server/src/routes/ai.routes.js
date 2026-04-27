const router = require('express').Router();
const { chat } = require('../controllers/ai.controller');
const rateLimit = require('express-rate-limit');

// Stricter limit on the AI endpoint — each request may call Gemini (external API)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10,             // max 10 AI requests per minute per IP
  message: { error: 'Too many AI requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
});

router.post('/chat', aiLimiter, chat);

module.exports = router;

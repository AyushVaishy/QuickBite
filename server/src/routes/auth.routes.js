const router = require("express").Router();
const { signup, login, logout, refreshToken, getMe, updateMe, changePassword, updateProfile } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate, signupSchema, loginSchema } = require("../middleware/validate");

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.put("/password", authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);

module.exports = router;

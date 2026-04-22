const router = require("express").Router();
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cart.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:cartItemId", updateItem);
router.delete("/items/:cartItemId", removeItem);
router.delete("/", clearCart);

module.exports = router;

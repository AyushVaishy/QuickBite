const router = require("express").Router();
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menu.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.get("/:restaurantId", getMenu);
router.post("/:restaurantId", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), addMenuItem);
router.put("/:restaurantId/items/:itemId", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), updateMenuItem);
router.delete("/:restaurantId/items/:itemId", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), deleteMenuItem);

module.exports = router;

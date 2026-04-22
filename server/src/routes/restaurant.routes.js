const router = require("express").Router();
const {
  getRestaurants,
  getRestaurant,
  searchRestaurants,
  createRestaurant,
  updateRestaurant,
  getMyRestaurants,
  toggleRestaurantOpen,
} = require("../controllers/restaurant.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.get("/", getRestaurants);
router.get("/search", searchRestaurants);
router.get("/my", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), getMyRestaurants);
router.get("/:id", getRestaurant);
router.post("/", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), createRestaurant);
router.put("/:id", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), updateRestaurant);
router.patch("/:id/toggle-open", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), toggleRestaurantOpen);

module.exports = router;

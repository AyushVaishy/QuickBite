const prisma = require("../config/prisma");

// Haversine formula: returns distance in km between two lat/lng points
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const ALLOWED_UPDATE_FIELDS = [
  "name", "description", "cuisines", "imageUrl", "lat", "lng",
  "address", "city", "costForTwo", "deliveryTime", "openingTime",
  "closingTime", "fssaiNumber", "phone",
];

const getRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const allRestaurants = await prisma.restaurant.findMany({
      where: { isOpen: true, isApproved: true },
      orderBy: { avgRating: "desc" },
    });

    // Apply distance filter if coordinates provided, then paginate
    const source = lat && lng
      ? allRestaurants.filter((r) => haversineKm(Number(lat), Number(lng), r.lat, r.lng) <= Number(radius))
      : allRestaurants;

    const total = source.length;
    const restaurants = source.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ restaurants, total });
  } catch (err) {
    next(err);
  }
};

const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: { reviews: { include: { user: { select: { name: true } } } } },
    });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
};

const searchRestaurants = async (req, res, next) => {
  try {
    const { q, lat, lng } = req.query;
    if (!q) return res.status(400).json({ message: "Query parameter q is required" });

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isOpen: true,
        isApproved: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { cuisines: { has: q } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
    });

    res.json({ restaurants, total: restaurants.length });
  } catch (err) {
    next(err);
  }
};

const createRestaurant = async (req, res, next) => {
  try {
    const {
      name, description, cuisines, imageUrl, lat, lng,
      address, city, costForTwo, deliveryTime, openingTime, closingTime, fssaiNumber, phone,
    } = req.body;
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: req.user.id, name, description, cuisines, imageUrl, lat, lng,
        address, city, costForTwo, deliveryTime, openingTime, closingTime, fssaiNumber, phone,
        isApproved: true,
      },
    });
    res.status(201).json({ restaurant });
  } catch (err) {
    next(err);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Restaurant not found" });
    if (existing.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: you do not own this restaurant" });
    }

    // Whitelist fields to prevent accidental overwrite of ownerId, isApproved, etc.
    const data = {};
    ALLOWED_UPDATE_FIELDS.forEach((key) => {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    });

    const restaurant = await prisma.restaurant.update({ where: { id: req.params.id }, data });
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
};

const getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { ownerId: req.user.id },
      include: {
        _count: { select: { orders: true, menuItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
};

const toggleRestaurantOpen = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { isOpen: !restaurant.isOpen },
    });
    res.json({ restaurant: updated });
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const restaurantId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Upsert review (one review per user per restaurant)
    const review = await prisma.review.upsert({
      where: { userId_restaurantId: { userId: req.user.id, restaurantId } },
      update: { rating, comment: comment || null },
      create: { userId: req.user.id, restaurantId, rating, comment: comment || null },
      include: { user: { select: { name: true } } },
    });

    // Recalculate avgRating
    const agg = await prisma.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        avgRating: Math.round((agg._avg.rating || 0) * 10) / 10,
        totalRatings: agg._count.rating,
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRestaurants, getRestaurant, searchRestaurants,
  createRestaurant, updateRestaurant,
  getMyRestaurants, toggleRestaurantOpen, createReview,
};

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

const getRestaurants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, page = 1, limit = 20 } = req.query;

    const restaurants = await prisma.restaurant.findMany({
      where: { isOpen: true, isApproved: true },
      skip: (page - 1) * Number(limit),
      take: Number(limit),
      orderBy: { avgRating: "desc" },
    });

    if (lat && lng) {
      const filtered = restaurants.filter((r) => {
        const dist = haversineKm(Number(lat), Number(lng), r.lat, r.lng);
        return dist <= Number(radius);
      });
      return res.json({ restaurants: filtered, total: filtered.length });
    }

    res.json({ restaurants, total: restaurants.length });
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
    const { name, description, cuisines, imageUrl, lat, lng, address, city, costForTwo, deliveryTime } = req.body;
    const restaurant = await prisma.restaurant.create({
      data: { ownerId: req.user.id, name, description, cuisines, imageUrl, lat, lng, address, city, costForTwo, deliveryTime },
    });
    res.status(201).json({ restaurant });
  } catch (err) {
    next(err);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: req.body,
    });
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
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ restaurants });
  } catch (err) { next(err); }
};

const toggleRestaurantOpen = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { isOpen: !restaurant.isOpen },
    });
    res.json({ restaurant: updated });
  } catch (err) { next(err); }
};

module.exports = { getRestaurants, getRestaurant, searchRestaurants, createRestaurant, updateRestaurant, getMyRestaurants, toggleRestaurantOpen };

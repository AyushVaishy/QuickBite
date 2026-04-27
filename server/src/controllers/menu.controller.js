const prisma = require("../config/prisma");

const getMenu = async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId: req.params.restaurantId, isAvailable: true },
      orderBy: { category: "asc" },
    });

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ menu: grouped });
  } catch (err) {
    next(err);
  }
};

// Owner/admin: returns flat list including unavailable items for management UI
const getMenuAll = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: req.params.restaurantId },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

const addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    if (restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, description, price, category, imageUrl, isVeg } = req.body;
    const item = await prisma.menuItem.create({
      data: { restaurantId: req.params.restaurantId, name, description, price, category, imageUrl, isVeg },
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.itemId } });
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: item.restaurantId } });
    if (restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.menuItem.update({ where: { id: req.params.itemId }, data: req.body });
    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.itemId } });
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: item.restaurantId } });
    if (restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.menuItem.update({ where: { id: req.params.itemId }, data: { isAvailable: false } });
    res.json({ message: "Menu item removed" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu, getMenuAll, addMenuItem, updateMenuItem, deleteMenuItem };

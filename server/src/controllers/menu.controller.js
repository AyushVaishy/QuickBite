const prisma = require("../config/prisma");

const getMenu = async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId: req.params.restaurantId, isAvailable: true },
      orderBy: { category: "asc" },
    });

    // Group by category
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

const addMenuItem = async (req, res, next) => {
  try {
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
    const item = await prisma.menuItem.update({
      where: { id: req.params.itemId },
      data: req.body,
    });
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    await prisma.menuItem.update({
      where: { id: req.params.itemId },
      data: { isAvailable: false },
    });
    res.json({ message: "Menu item removed" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMenu, addMenuItem, updateMenuItem, deleteMenuItem };

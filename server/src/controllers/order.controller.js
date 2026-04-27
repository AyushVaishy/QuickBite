const prisma = require("../config/prisma");

const createOrder = async (req, res, next) => {
  try {
    const { items, restaurantId, deliveryAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    // Verify the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Fetch menu items and verify they belong to this restaurant
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId },
    });
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: "One or more items are invalid for this restaurant" });
    }

    const menuMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));
    const totalAmount = items.reduce(
      (sum, i) => sum + (menuMap[i.menuItemId]?.price ?? 0) * i.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        restaurantId,
        addressId: null,
        totalAmount,
        notes: deliveryAddress || notes || null,
        items: {
          create: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            priceAtTime: menuMap[i.menuItemId].price,
          })),
        },
      },
      include: {
        items: { include: { menuItem: { select: { name: true, price: true } } } },
        restaurant: { select: { name: true, imageUrl: true } },
      },
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        restaurant: { select: { name: true, imageUrl: true } },
        items: { include: { menuItem: { select: { name: true, price: true, isVeg: true, imageUrl: true, restaurantId: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
        address: true,
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id && req.user.role === "USER") {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// Valid status transitions for order flow
const ALLOWED_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { restaurant: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure the caller owns this restaurant (or is admin)
    if (order.restaurant.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${order.status} to ${status}`,
        allowedTransitions: allowed,
      });
    }

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
};

const getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ orders });
  } catch (err) { next(err); }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order in ${order.status} status` });
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });
    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, getRestaurantOrders, cancelOrder };

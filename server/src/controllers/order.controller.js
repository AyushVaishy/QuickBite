const prisma = require("../config/prisma");

const createOrder = async (req, res, next) => {
  try {
    const { addressId } = req.body;
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { menuItem: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        restaurantId: cart.restaurantId,
        addressId,
        totalAmount,
        items: {
          create: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            priceAtTime: i.menuItem.price,
          })),
        },
      },
      include: { items: { include: { menuItem: true } }, restaurant: true, address: true },
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } });

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
        items: { include: { menuItem: { select: { name: true } } } },
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

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ order });
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

module.exports = { createOrder, getOrders, getOrder, updateOrderStatus, getRestaurantOrders };

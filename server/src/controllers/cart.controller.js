const prisma = require("../config/prisma");

const getCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: { include: { menuItem: true } },
        restaurant: { select: { id: true, name: true, imageUrl: true } },
      },
    });
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;
    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    // If cart exists for a different restaurant, clear it first
    if (cart && cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { restaurantId: menuItem.restaurantId },
      });
    }

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id, restaurantId: menuItem.restaurantId },
      });
    }

    // Upsert cart item (add or increment quantity)
    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, menuItemId, quantity },
      include: { menuItem: true },
    });

    res.json({ cartItem });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.cartItemId },
      data: { quantity },
      include: { menuItem: true },
    });
    res.json({ cartItem });
  } catch (err) {
    next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.cartItemId } });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } });
    }
    res.json({ message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };

const prisma = require('../config/prisma');

const getReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { restaurantId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) { next(err); }
};

const createReview = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Check user has a DELIVERED order from this restaurant
    const deliveredOrder = await prisma.order.findFirst({
      where: { userId: req.user.id, restaurantId, status: 'DELIVERED' },
    });
    if (!deliveredOrder) return res.status(403).json({ message: 'You can only review restaurants you have ordered from and received delivery' });

    const review = await prisma.review.upsert({
      where: { userId_restaurantId: { userId: req.user.id, restaurantId } },
      create: { userId: req.user.id, restaurantId, rating, comment: comment || null },
      update: { rating, comment: comment || null },
      include: { user: { select: { name: true } } },
    });

    const allReviews = await prisma.review.findMany({ where: { restaurantId }, select: { rating: true } });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { avgRating: Math.round(avg * 10) / 10, totalRatings: allReviews.length },
    });

    res.status(201).json({ review });
  } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.reviewId } });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
    await prisma.review.delete({ where: { id: req.params.reviewId } });

    const allReviews = await prisma.review.findMany({ where: { restaurantId: review.restaurantId }, select: { rating: true } });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await prisma.restaurant.update({ where: { id: review.restaurantId }, data: { avgRating: Math.round(avg * 10) / 10, totalRatings: allReviews.length } });
    } else {
      await prisma.restaurant.update({ where: { id: review.restaurantId }, data: { avgRating: 0, totalRatings: 0 } });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};

const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: {
        restaurant: { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) { next(err); }
};

module.exports = { getReviews, createReview, deleteReview, getMyReviews };

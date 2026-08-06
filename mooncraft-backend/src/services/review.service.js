const reviewRepository = require('../repositories/review.repository');
const orderRepository = require('../repositories/order.repository');

const VALID_STATUSES = ['approved', 'rejected'];

class ReviewService {
  async submitPublicReview(data) {
    const { orderId, customerName, rating, comment, avatarUrl } = data;

    if (!orderId) {
      throw new Error('Order ID is required');
    }
    if (!customerName || customerName.trim().length < 2) {
      throw new Error('Customer name must be at least 2 characters long');
    }
    const ratingNum = parseInt(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }
    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment is required');
    }

    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status !== 'delivered') {
      throw new Error('Reviews can only be submitted for delivered orders');
    }

    const alreadyReviewed = await reviewRepository.hasOrderBeenReviewed(orderId);
    if (alreadyReviewed) {
      throw new Error('This order has already been reviewed');
    }

    const reviewId = await reviewRepository.createReview(
      orderId,
      customerName.trim(),
      ratingNum,
      comment.trim(),
      avatarUrl || null
    );

    return { reviewId, message: 'Review submitted and pending approval' };
  }

  async getPublicReviews(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const reviews = await reviewRepository.getPublicReviews(limit, offset);
    const total = await reviewRepository.getPublicReviewCount();

    return {
      reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getPendingReviews(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const reviews = await reviewRepository.getPendingReviews(limit, offset);
    const total = await reviewRepository.getPendingReviewCount();

    return {
      reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async updateReviewStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error("Status must be 'approved' or 'rejected'");
    }

    const review = await reviewRepository.getReviewById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    await reviewRepository.updateReviewStatus(id, status);
    return await reviewRepository.getReviewById(id);
  }

  async hasOrderBeenReviewed(orderId) {
    return await reviewRepository.hasOrderBeenReviewed(orderId);
  }
}

module.exports = new ReviewService();

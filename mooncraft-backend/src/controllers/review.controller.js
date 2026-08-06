const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const reviewService = require('../services/review.service');

async function submitPublicReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { orderId, customerName, rating, comment } = req.body;
    const avatarUrl = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    const result = await reviewService.submitPublicReview({
      orderId,
      customerName,
      rating,
      comment,
      avatarUrl
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      reviewId: result.reviewId
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: error.message });
    }
    if (error.message === 'This order has already been reviewed' ||
        error.message === 'Reviews can only be submitted for delivered orders') {
      return res.status(STATUS_CODES.CONFLICT).json({ success: false, message: error.message });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getPublicReviews(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await reviewService.getPublicReviews(page, limit);

    res.json({
      success: true,
      data: result.reviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getPendingReviews(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await reviewService.getPendingReviews(page, limit);

    res.json({
      success: true,
      data: result.reviews,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateReviewStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updatedReview = await reviewService.updateReviewStatus(id, status);

    res.json({
      success: true,
      message: `Review ${status}`,
      data: updatedReview
    });
  } catch (error) {
    if (error.message === 'Review not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: error.message });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function checkOrderReviewed(req, res, next) {
  try {
    const { orderId } = req.params;
    const hasReviewed = await reviewService.hasOrderBeenReviewed(orderId);

    res.json({
      success: true,
      data: { hasReviewed }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitPublicReview,
  getPublicReviews,
  getPendingReviews,
  updateReviewStatus,
  checkOrderReviewed
};

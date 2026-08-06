const express = require('express');
const { param, body, query } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const reviewUpload = require('../middleware/review-upload.middleware');

const router = express.Router();

// Public endpoints
router.get(
  '/public',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  reviewController.getPublicReviews
);

router.post(
  '/public',
  reviewUpload.single('avatar'),
  [
    body('orderId').notEmpty().isInt(),
    body('customerName').notEmpty().isLength({ min: 2 }),
    body('rating').notEmpty().isInt({ min: 1, max: 5 }),
    body('comment').notEmpty().isLength({ min: 1 })
  ],
  reviewController.submitPublicReview
);

router.get(
  '/check/:orderId',
  authMiddleware,
  [param('orderId').isInt()],
  reviewController.checkOrderReviewed
);

// Admin endpoints
router.get(
  '/admin/pending',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  reviewController.getPendingReviews
);

router.patch(
  '/admin/:id/status',
  authMiddleware,
  adminMiddleware,
  [
    param('id').isInt(),
    body('status').isIn(['approved', 'rejected'])
  ],
  reviewController.updateReviewStatus
);

module.exports = router;

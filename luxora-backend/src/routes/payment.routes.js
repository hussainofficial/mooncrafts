const express = require('express');
const { param, body, query } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public endpoints
router.get('/methods', paymentController.getPaymentMethods);
router.get('/upi-apps', paymentController.getUPIApps);

// Protected endpoints (User)
router.post(
  '/process',
  authMiddleware,
  [
    body('orderId').isInt(),
    body('amount').isFloat({ min: 0 }),
    body('paymentMethod').notEmpty(),
    body('transactionId').optional()
  ],
  paymentController.processPayment
);

router.get(
  '/verify/:transactionId',
  authMiddleware,
  [param('transactionId').notEmpty()],
  paymentController.verifyPayment
);

router.get(
  '/order/:orderId',
  authMiddleware,
  [param('orderId').isInt()],
  paymentController.getPaymentByOrder
);

router.get('/user/list', authMiddleware, paymentController.getUserPayments);

// Admin endpoints
router.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  [
    query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 })
  ],
  paymentController.getAllPayments
);

router.get(
  '/admin/stats',
  authMiddleware,
  adminMiddleware,
  paymentController.getPaymentStats
);

router.get(
  '/admin/revenue',
  authMiddleware,
  adminMiddleware,
  [query('days').optional().isInt({ min: 1 })],
  paymentController.getDailyRevenue
);

router.get(
  '/admin/analytics',
  authMiddleware,
  adminMiddleware,
  paymentController.getPaymentStats
);

module.exports = router;

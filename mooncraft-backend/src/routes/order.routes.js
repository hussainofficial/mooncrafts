const express = require('express');
const { param, body, query } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Create order (Public - Guest or Logged In Users)
router.post(
  '/',
  [
    body('items').isArray().notEmpty(),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.price').isFloat({ min: 0 }),
    body('paymentMethod').notEmpty(),
    body('totalAmount').isFloat({ min: 0 }),
    body('guestEmail').optional().isEmail(),
    body('guestPhone').optional(),
    body('guestName').optional(),
    body('shippingAddressId').optional().isInt(),
    body('billingAddressId').optional().isInt()
  ],
  orderController.createOrder
);

router.get(
  '/user/my-orders',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  orderController.getUserOrders
);

router.get(
  '/:orderId',
  authMiddleware,
  [param('orderId').isInt()],
  orderController.getOrderById
);

router.put(
  '/:orderId/cancel',
  authMiddleware,
  [param('orderId').isInt()],
  orderController.cancelOrder
);

// Admin routes (protected)
router.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  ],
  orderController.getAllOrders
);

router.put(
  '/admin/:orderId/status',
  authMiddleware,
  adminMiddleware,
  [
    param('orderId').isInt(),
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  ],
  orderController.updateOrderStatus
);

router.get(
  '/admin/stats',
  authMiddleware,
  adminMiddleware,
  orderController.getDashboardStats
);

router.get(
  '/admin/analytics',
  authMiddleware,
  adminMiddleware,
  orderController.getDashboardStats
);

module.exports = router;

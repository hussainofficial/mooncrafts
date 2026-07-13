const express = require('express');
const { body, param } = require('express-validator');
const razorpayController = require('../controllers/razorpay.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Create Razorpay Order (Public - Guest or Logged In Users)
router.post(
  '/create-order',
  [
    body('orderId').isInt().withMessage('Order ID must be an integer'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR']).withMessage('Invalid currency')
  ],
  razorpayController.createOrder
);

// Verify Payment (Public - Guest or Logged In Users)
router.post(
  '/verify-payment',
  [
    body('orderId').isInt().withMessage('Order ID must be an integer'),
    body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required')
  ],
  razorpayController.verifyPayment
);

// Handle Payment Failure (Public - Guest or Logged In Users)
router.post(
  '/payment-failure',
  [
    body('orderId').isInt().withMessage('Order ID must be an integer'),
    body('razorpayPaymentId').optional(),
    body('reason').optional().isString()
  ],
  razorpayController.handlePaymentFailure
);

// Webhook - Payment Status Updates (No authentication - Razorpay calls this)
router.post(
  '/webhook',
  [
    body('event').notEmpty().withMessage('Event type is required'),
    body('payload').isObject().withMessage('Payload must be an object')
  ],
  razorpayController.handleWebhook
);

// Get Payment Status (Protected - User must be authenticated)
router.get(
  '/status/:orderId',
  authMiddleware,
  [
    param('orderId').isInt().withMessage('Order ID must be an integer')
  ],
  razorpayController.getPaymentStatus
);

module.exports = router;

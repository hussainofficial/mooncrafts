const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analytics.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All analytics endpoints require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ============ ORDER ANALYTICS ============

/**
 * GET /api/v1/analytics/orders
 * Get aggregated order statistics
 */
router.get('/orders', analyticsController.getOrderAnalytics);

// ============ PAYMENT ANALYTICS ============

/**
 * GET /api/v1/analytics/payments
 * Get aggregated payment statistics
 */
router.get('/payments', analyticsController.getPaymentAnalytics);

/**
 * GET /api/v1/analytics/payments/methods
 * Get payment method breakdown
 */
router.get('/payments/methods', analyticsController.getPaymentMethodBreakdown);

/**
 * GET /api/v1/analytics/payments/daily-revenue
 * Get daily revenue for specified days
 * Query params:
 *   - days: number (1-365, default: 30)
 */
router.get(
  '/payments/daily-revenue',
  [query('days').optional().isInt({ min: 1, max: 365 })],
  analyticsController.getDailyRevenue
);

// ============ PRODUCT ANALYTICS ============

/**
 * GET /api/v1/analytics/products
 * Get aggregated product statistics
 */
router.get('/products', analyticsController.getProductAnalytics);

/**
 * GET /api/v1/analytics/products/top
 * Get top products by various metrics
 * Query params:
 *   - sortBy: string ('price', 'sales', 'stock', default: 'price')
 *   - limit: number (1-50, default: 10)
 */
router.get(
  '/products/top',
  [
    query('sortBy').optional().isIn(['price', 'sales', 'stock']),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  analyticsController.getTopProducts
);

// ============ USER ANALYTICS ============

/**
 * GET /api/v1/analytics/users
 * Get aggregated user statistics
 */
router.get('/users', analyticsController.getUserAnalytics);

/**
 * GET /api/v1/analytics/users/top-customers
 * Get top customers by spending
 * Query params:
 *   - limit: number (1-50, default: 10)
 */
router.get(
  '/users/top-customers',
  [query('limit').optional().isInt({ min: 1, max: 50 })],
  analyticsController.getTopCustomers
);

/**
 * GET /api/v1/analytics/users/daily-registrations
 * Get daily user registrations
 * Query params:
 *   - days: number (1-365, default: 30)
 */
router.get(
  '/users/daily-registrations',
  [query('days').optional().isInt({ min: 1, max: 365 })],
  analyticsController.getDailyRegistrations
);

// ============ CATEGORY ANALYTICS ============

/**
 * GET /api/v1/analytics/categories
 * Get category performance metrics
 */
router.get('/categories', analyticsController.getCategoryAnalytics);

/**
 * GET /api/v1/analytics/inventory
 * Get inventory value by category
 */
router.get('/inventory', analyticsController.getInventoryValueByCategory);

// ============ SALES ANALYTICS ============

/**
 * GET /api/v1/analytics/monthly-revenue
 * Get monthly revenue data
 * Query params:
 *   - months: number (1-24, default: 12)
 */
router.get(
  '/monthly-revenue',
  [query('months').optional().isInt({ min: 1, max: 24 })],
  analyticsController.getMonthlyRevenue
);

/**
 * GET /api/v1/analytics/conversion
 * Get conversion metrics (users to customers)
 */
router.get('/conversion', analyticsController.getConversionMetrics);

// ============ DASHBOARD ANALYTICS ============

/**
 * GET /api/v1/analytics/dashboard
 * Get comprehensive dashboard analytics combining all key metrics
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

module.exports = router;

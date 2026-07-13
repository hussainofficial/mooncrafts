const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  // ============ ORDER ANALYTICS ============

  /**
   * Get order analytics
   * @route GET /api/v1/orders/admin/analytics
   */
  async getOrderAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getOrderAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ PAYMENT ANALYTICS ============

  /**
   * Get payment analytics
   * @route GET /api/v1/payments/admin/analytics
   */
  async getPaymentAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getPaymentAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get payment method breakdown
   * @route GET /api/v1/payments/admin/analytics/methods
   */
  async getPaymentMethodBreakdown(req, res, next) {
    try {
      const data = await analyticsService.getPaymentMethodBreakdown();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get daily revenue
   * @route GET /api/v1/payments/admin/analytics/daily-revenue
   * @query days - Number of days to retrieve (1-365, default: 30)
   */
  async getDailyRevenue(req, res, next) {
    try {
      const { days } = req.query;
      const data = await analyticsService.getDailyRevenue(days);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ PRODUCT ANALYTICS ============

  /**
   * Get product analytics
   * @route GET /api/v1/products/admin/analytics
   */
  async getProductAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getProductAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get top products
   * @route GET /api/v1/products/admin/analytics/top
   * @query sortBy - Sort metric: 'price' (default), 'sales', 'stock'
   * @query limit - Number of products (1-50, default: 10)
   */
  async getTopProducts(req, res, next) {
    try {
      const { sortBy = 'price', limit = 10 } = req.query;

      // Validate limit
      const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

      const data = await analyticsService.getTopProducts(sortBy, validLimit);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ USER ANALYTICS ============

  /**
   * Get user analytics
   * @route GET /api/v1/users/admin/analytics
   */
  async getUserAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getUserAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get top customers
   * @route GET /api/v1/users/admin/analytics/top-customers
   * @query limit - Number of customers (1-50, default: 10)
   */
  async getTopCustomers(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      // Validate limit
      const validLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

      const data = await analyticsService.getTopCustomers(validLimit);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get daily registrations
   * @route GET /api/v1/users/admin/analytics/daily-registrations
   * @query days - Number of days to retrieve (1-365, default: 30)
   */
  async getDailyRegistrations(req, res, next) {
    try {
      const { days } = req.query;
      const data = await analyticsService.getDailyRegistrations(days);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ CATEGORY ANALYTICS ============

  /**
   * Get category analytics
   * @route GET /api/v1/analytics/admin/categories
   */
  async getCategoryAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getCategoryAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get inventory value by category
   * @route GET /api/v1/analytics/admin/inventory
   */
  async getInventoryValueByCategory(req, res, next) {
    try {
      const data = await analyticsService.getInventoryValueByCategory();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ SALES ANALYTICS ============

  /**
   * Get monthly revenue
   * @route GET /api/v1/analytics/admin/monthly-revenue
   * @query months - Number of months to retrieve (1-24, default: 12)
   */
  async getMonthlyRevenue(req, res, next) {
    try {
      const { months = 12 } = req.query;
      const data = await analyticsService.getMonthlyRevenue(months);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get conversion metrics
   * @route GET /api/v1/analytics/admin/conversion
   */
  async getConversionMetrics(req, res, next) {
    try {
      const data = await analyticsService.getConversionMetrics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============ DASHBOARD ANALYTICS ============

  /**
   * Get comprehensive dashboard analytics
   * @route GET /api/v1/analytics/admin/dashboard
   */
  async getDashboardAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getDashboardAnalytics();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();

const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const paymentService = require('../services/payment.service');

class PaymentController {
  // Process payment
  async processPayment(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, amount, paymentMethod, transactionId } = req.body;

      const payment = await paymentService.processPayment(userId, {
        orderId,
        amount,
        paymentMethod,
        transactionId
      });

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: payment.message,
        data: payment
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('Not authorized')) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: error.message
        });
      }
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // Verify payment
  async verifyPayment(req, res, next) {
    try {
      const { transactionId } = req.params;
      const userId = req.user.id;

      const payment = await paymentService.verifyPayment(transactionId, userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: payment
      });
    } catch (error) {
      if (error.message === 'Payment not found') {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: error.message
        });
      }
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get payment by order ID
  async getPaymentByOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const payment = await paymentService.getPaymentByOrder(orderId, userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: payment
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: error.message
        });
      }
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user payments
  async getUserPayments(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const result = await paymentService.getUserPayments(userId, limit, offset);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: result.payments,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: result.pages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all payments (admin)
  async getAllPayments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const result = await paymentService.getAllPayments(limit, offset, filters);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: result.payments,
        pagination: {
          total: result.total,
          page,
          limit,
          pages: result.pages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get payment methods
  async getPaymentMethods(req, res, next) {
    try {
      const methods = paymentService.getPaymentMethods();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: methods
      });
    } catch (error) {
      next(error);
    }
  }

  // Get UPI apps
  async getUPIApps(req, res, next) {
    try {
      const apps = paymentService.getUPIApps();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: apps
      });
    } catch (error) {
      next(error);
    }
  }

  // Get dashboard stats (admin)
  async getPaymentStats(req, res, next) {
    try {
      const stats = await paymentService.getPaymentStats();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Get daily revenue (admin)
  async getDailyRevenue(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;

      const data = await paymentService.getDailyRevenue(days);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();

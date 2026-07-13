const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const orderService = require('../services/order.service');

class OrderController {
  // Create new order (Guest or Logged In)
  async createOrder(req, res, next) {
    try {
      const { items, shippingAddressId, billingAddressId, paymentMethod, totalAmount, guestEmail, guestPhone, guestName } = req.body;

      // Determine if user is logged in or guest
      const userId = req.user?.id || null;
      const isGuest = !userId;

      let orderData = {
        items,
        shippingAddressId,
        billingAddressId,
        paymentMethod,
        totalAmount
      };

      // Add guest details if not logged in
      if (isGuest) {
        if (!guestEmail) {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: 'Guest email is required for checkout without login'
          });
        }
        orderData.guestEmail = guestEmail;
        orderData.guestPhone = guestPhone || null;
        orderData.guestName = guestName || null;
        console.log('👤 Guest checkout:', { email: guestEmail, phone: guestPhone });
      }

      const order = await orderService.createOrder(userId, orderData);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get order by ID
  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';

      const order = await orderService.getOrderById(orderId, isAdmin ? null : userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: order
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Not authorized to view this order') {
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

  // Get user orders
  async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const result = await orderService.getUserOrders(userId, limit, offset);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: result.orders,
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

  // Get all orders (admin)
  async getAllOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const result = await orderService.getAllOrders(limit, offset, filters);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: result.orders,
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

  // Update order status
  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(orderId, status);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Order status updated',
        data: order
      });
    } catch (error) {
      if (error.message === 'Order not found') {
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

  // Cancel order
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await orderService.cancelOrder(orderId, userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
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

  // Get dashboard stats (admin)
  async getDashboardStats(req, res, next) {
    try {
      const stats = await orderService.getDashboardStats();

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();

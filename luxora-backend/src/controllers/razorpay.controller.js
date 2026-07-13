const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const razorpayService = require('../services/razorpay.service');
const orderRepository = require('../repositories/order.repository');
const paymentRepository = require('../repositories/payment.repository');

class RazorpayController {
  // Create Razorpay Order (Guest or Logged In)
  async createOrder(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { orderId, amount, currency = 'INR' } = req.body;

      console.log('🔐 Creating Razorpay order:', { orderId, amount, userId: userId || 'guest' });

      // Validate input
      if (!orderId || !amount) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Order ID and amount are required'
        });
      }

      // Verify order exists
      const order = await orderRepository.getOrderById(orderId);
      if (!order) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check authorization: allow if logged-in user owns order, or if guest order (user_id is null)
      if (userId && order.user_id && order.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to process payment for this order'
        });
      }

      console.log('✅ Order authorized for payment');

      // Verify amount matches order total (within 1 rupee tolerance for fees)
      if (Math.abs(parseFloat(amount) - parseFloat(order.total_amount)) > 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Payment amount does not match order total'
        });
      }

      // Create payment record first
      const paymentId = await paymentRepository.createPayment(
        orderId,
        amount,
        'razorpay',
        null
      );

      console.log('💳 Payment record created:', paymentId);

      // Create Razorpay order
      const razorpayOrder = await razorpayService.createOrder(
        orderId,
        amount,
        currency,
        order.email
      );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: razorpayOrder
      });
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error.message);
      next(error);
    }
  }

  // Verify Payment (Guest or Logged In)
  async verifyPayment(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      console.log('🔐 Verifying payment:', { orderId, userId: userId || 'guest' });

      // Validate input
      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Missing required payment verification data'
        });
      }

      // Verify order exists
      const order = await orderRepository.getOrderById(orderId);
      if (!order) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check authorization: allow if logged-in user owns order, or if guest order (user_id is null)
      if (userId && order.user_id && order.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to verify this payment'
        });
      }

      console.log('✅ Payment authorization check passed');

      // Verify payment signature
      const verificationResult = await razorpayService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      console.log('✅ Payment verified successfully for order:', orderId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Payment verified successfully',
        data: verificationResult
      });
    } catch (error) {
      console.error('❌ Payment verification error:', error.message);

      // Log the verification failure
      if (req.body.orderId) {
        try {
          await paymentRepository.updatePaymentStatus(
            req.body.orderId,
            'failed',
            {
              failureReason: error.message,
              razorpayPaymentId: req.body.razorpayPaymentId
            }
          );
        } catch (updateError) {
          console.error('❌ Error updating payment status:', updateError.message);
        }
      }

      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Payment verification failed'
      });
    }
  }

  // Handle payment failure (Guest or Logged In)
  async handlePaymentFailure(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { orderId, razorpayPaymentId, reason } = req.body;

      console.log('❌ Payment failure recorded:', { orderId, reason, userId: userId || 'guest' });

      if (!orderId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Verify order exists
      const order = await orderRepository.getOrderById(orderId);
      if (!order) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check authorization: allow if logged-in user owns order, or if guest order (user_id is null)
      if (userId && order.user_id && order.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to update this payment'
        });
      }

      // Record payment failure
      await razorpayService.handlePaymentFailure(
        orderId,
        razorpayPaymentId,
        reason || 'Payment cancelled by user'
      );

      console.log('❌ Payment failure recorded for order:', orderId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Payment failure recorded'
      });
    } catch (error) {
      console.error('❌ Error handling payment failure:', error.message);
      next(error);
    }
  }

  // Webhook handler (called by Razorpay, no authentication needed)
  async handleWebhook(req, res, next) {
    try {
      const { event, payload } = req.body;

      console.log('🔔 Razorpay webhook received:', event);

      // Verify webhook signature
      const razorpaySignature = req.headers['x-razorpay-signature'];
      if (!razorpaySignature) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          ok: false,
          message: 'Missing webhook signature'
        });
      }

      // TODO: Implement webhook signature verification
      // For now, we'll trust Razorpay (in production, always verify)

      switch (event) {
        case 'payment.authorized':
          await this.handlePaymentAuthorized(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;

        case 'refund.created':
          await this.handleRefundCreated(payload);
          break;

        default:
          console.log('⚠️ Unknown webhook event:', event);
      }

      // Always respond with 200 OK to acknowledge receipt
      res.status(STATUS_CODES.OK).json({ ok: true });
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      // Still respond with 200 to prevent Razorpay from retrying
      res.status(STATUS_CODES.OK).json({ ok: true, error: error.message });
    }
  }

  // Handle payment.authorized webhook
  async handlePaymentAuthorized(payload) {
    try {
      const { payment } = payload;
      const orderId = payment.notes.orderId;

      console.log('✅ Payment authorized for order:', orderId);

      // Payment is already marked as completed in verifyPayment
      // This webhook is for additional tracking/logging
    } catch (error) {
      console.error('❌ Error handling payment.authorized webhook:', error.message);
    }
  }

  // Handle payment.failed webhook
  async handlePaymentFailed(payload) {
    try {
      const { payment } = payload;
      const orderId = payment.notes?.orderId;

      if (!orderId) {
        console.warn('⚠️ No order ID in failed payment webhook');
        return;
      }

      console.log('❌ Payment failed for order:', orderId);

      await paymentRepository.updatePaymentStatus(orderId, 'failed', {
        razorpayPaymentId: payment.id,
        failureReason: payment.error?.description || 'Payment failed'
      });
    } catch (error) {
      console.error('❌ Error handling payment.failed webhook:', error.message);
    }
  }

  // Handle payment.captured webhook
  async handlePaymentCaptured(payload) {
    try {
      const { payment } = payload;
      const orderId = payment.notes?.orderId;

      if (!orderId) {
        console.warn('⚠️ No order ID in captured payment webhook');
        return;
      }

      console.log('✅ Payment captured for order:', orderId);

      await paymentRepository.updatePaymentStatus(orderId, 'completed', {
        razorpayPaymentId: payment.id
      });
    } catch (error) {
      console.error('❌ Error handling payment.captured webhook:', error.message);
    }
  }

  // Handle refund.created webhook
  async handleRefundCreated(payload) {
    try {
      const { refund } = payload;

      console.log('💰 Refund created:', refund.id);

      // Log refund in payment logs (for audit trail)
      // Implementation depends on your payment logging strategy
    } catch (error) {
      console.error('❌ Error handling refund.created webhook:', error.message);
    }
  }

  // Get payment status
  async getPaymentStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await orderRepository.getOrderById(orderId);
      if (!order || order.user_id !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Not authorized to view this payment'
        });
      }

      const payment = await paymentRepository.getPaymentByOrderId(orderId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('❌ Error fetching payment status:', error.message);
      res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Payment not found'
      });
    }
  }
}

module.exports = new RazorpayController();

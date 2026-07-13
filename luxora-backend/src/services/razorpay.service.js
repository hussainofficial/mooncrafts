const Razorpay = require('razorpay');
const crypto = require('crypto');
const paymentRepository = require('../repositories/payment.repository');
const orderRepository = require('../repositories/order.repository');

class RazorpayService {
  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured in environment variables');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.keySecret = keySecret;
  }

  // Create Razorpay order
  async createOrder(orderId, amount, currency = 'INR', userEmail = null) {
    try {
      if (!orderId || !amount) {
        throw new Error('Order ID and amount are required');
      }

      const razorpayOrderData = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: `order_${orderId}_${Date.now()}`,
        notes: {
          orderId: orderId.toString(),
          timestamp: new Date().toISOString()
        }
      };

      console.log('📊 Creating Razorpay order with data:', razorpayOrderData);

      const razorpayOrder = await this.razorpay.orders.create(razorpayOrderData);

      console.log('✅ Razorpay order created:', razorpayOrder.id);

      // Store Razorpay order ID in payment record
      await paymentRepository.updatePaymentRazorpayOrderId(
        orderId,
        razorpayOrder.id
      );

      return {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        currency: currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: orderId
      };
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  // Verify payment signature (HMAC SHA256)
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      if (!orderId || !paymentId || !signature) {
        throw new Error('Order ID, Payment ID, and Signature are required');
      }

      // Create signature string: {orderId}|{paymentId}
      const signatureString = `${orderId}|${paymentId}`;

      // Generate HMAC SHA256 signature
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(signatureString)
        .digest('hex');

      console.log('🔐 Signature verification:');
      console.log('   Generated:', generatedSignature);
      console.log('   Received:', signature);
      console.log('   Match:', generatedSignature === signature ? '✅ YES' : '❌ NO');

      // Constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signature)
      );

      return isValid;
    } catch (error) {
      console.error('❌ Signature verification failed:', error.message);
      return false;
    }
  }

  // Verify payment and update database
  async verifyPayment(orderId, paymentId, signature) {
    try {
      // Verify signature
      const isValidSignature = this.verifyPaymentSignature(orderId, paymentId, signature);

      if (!isValidSignature) {
        throw new Error('Invalid payment signature - Payment verification failed');
      }

      console.log('✅ Signature verified successfully');

      // Fetch payment details from Razorpay
      const paymentDetails = await this.razorpay.payments.fetch(paymentId);

      console.log('📋 Payment details from Razorpay:', {
        id: paymentDetails.id,
        status: paymentDetails.status,
        amount: paymentDetails.amount,
        method: paymentDetails.method
      });

      // Update payment status in database
      await paymentRepository.updatePaymentStatus(
        orderId,
        'completed',
        {
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          gatewayName: 'razorpay',
          gatewayResponse: JSON.stringify({
            status: paymentDetails.status,
            method: paymentDetails.method,
            fee: paymentDetails.fee,
            tax: paymentDetails.tax,
            contact: paymentDetails.contact
          })
        }
      );

      // Update order status to processing
      await orderRepository.updateOrderStatus(orderId, 'processing');

      console.log('✅ Payment verified and recorded successfully');

      return {
        success: true,
        message: 'Payment verified successfully',
        orderId: orderId,
        paymentId: paymentId,
        status: paymentDetails.status
      };
    } catch (error) {
      console.error('❌ Payment verification error:', error.message);

      // Update payment status to failed
      try {
        await paymentRepository.updatePaymentStatus(orderId, 'failed', {
          failureReason: error.message
        });
      } catch (updateError) {
        console.error('❌ Error updating payment status:', updateError.message);
      }

      throw error;
    }
  }

  // Handle payment failed callback
  async handlePaymentFailure(orderId, paymentId, error) {
    try {
      await paymentRepository.updatePaymentStatus(orderId, 'failed', {
        razorpayPaymentId: paymentId,
        failureReason: error
      });

      console.log('✅ Payment failure recorded for order:', orderId);

      return { success: true, message: 'Payment failure recorded' };
    } catch (err) {
      console.error('❌ Error handling payment failure:', err.message);
      throw err;
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null) {
    try {
      const refundData = amount ? { amount: Math.round(amount * 100) } : {};

      const refund = await this.razorpay.payments.refund(paymentId, refundData);

      console.log('✅ Refund initiated:', refund.id);

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error) {
      console.error('❌ Refund error:', error.message);
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  // Fetch payment details from Razorpay
  async fetchPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        fee: payment.fee,
        tax: payment.tax,
        acquirerData: payment.acquirer_data
      };
    } catch (error) {
      console.error('❌ Error fetching payment details:', error.message);
      throw error;
    }
  }
}

module.exports = new RazorpayService();

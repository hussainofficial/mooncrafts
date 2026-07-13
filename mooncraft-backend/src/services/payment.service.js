const paymentRepository = require('../repositories/payment.repository');
const orderRepository = require('../repositories/order.repository');

class PaymentService {
  // Process payment
  async processPayment(userId, paymentData) {
    const { orderId, amount, paymentMethod, transactionId } = paymentData;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      throw new Error('Missing required payment details');
    }

    // Verify order exists and belongs to user
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.user_id !== userId) {
      throw new Error('Not authorized to process payment for this order');
    }

    // Check amount matches
    if (Math.abs(parseFloat(amount) - parseFloat(order.total_amount)) > 0.01) {
      throw new Error('Payment amount does not match order total');
    }

    // Validate payment method
    if (!this.isValidPaymentMethod(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    // Create payment record
    const paymentId = await paymentRepository.createPayment(orderId, amount, paymentMethod, transactionId);

    // Simulate payment processing (in production, integrate with payment gateway)
    await paymentRepository.updatePaymentStatus(paymentId, 'completed');
    await orderRepository.updateOrderStatus(orderId, 'processing');

    const payment = await paymentRepository.getPaymentById(paymentId);
    return { ...payment, message: 'Payment processed successfully' };
  }

  // Verify payment
  async verifyPayment(transactionId, userId = null) {
    const payment = await paymentRepository.getPaymentByTransactionId(transactionId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // If userId provided, verify authorization
    if (userId) {
      const order = await orderRepository.getOrderById(payment.order_id);
      if (!order || order.user_id !== userId) {
        throw new Error('Not authorized to view this payment');
      }
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.payment_method,
      transactionId: payment.transaction_id,
      createdAt: payment.created_at,
      orderId: payment.order_id
    };
  }

  // Get payment by order ID
  async getPaymentByOrder(orderId, userId = null) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (userId && order.user_id !== userId) {
      throw new Error('Not authorized to view this order');
    }

    const payment = await paymentRepository.getPaymentByOrderId(orderId);
    if (!payment) {
      throw new Error('No payment found for this order');
    }

    return payment;
  }

  // Get user payments
  async getUserPayments(userId, limit = 20, offset = 0) {
    const payments = await paymentRepository.getUserPayments(userId, limit, offset);
    const total = await paymentRepository.getUserPaymentsCount(userId);

    return {
      payments,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get all payments (admin)
  async getAllPayments(limit = 20, offset = 0, filters = {}) {
    let payments;

    if (filters.status) {
      payments = await paymentRepository.getPaymentsByStatus(filters.status, limit, offset);
    } else {
      payments = await paymentRepository.getAllPayments(limit, offset);
    }

    const total = await paymentRepository.getPaymentCount();

    return {
      payments,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get payment methods
  getPaymentMethods() {
    return [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { id: 'upi', name: 'UPI', icon: '📱' },
      { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
      { id: 'wallet', name: 'Digital Wallet', icon: '👛' },
      { id: 'cod', name: 'Cash on Delivery', icon: '🚚' }
    ];
  }

  // Get UPI apps
  getUPIApps() {
    return [
      { id: 'google_pay', name: 'Google Pay', icon: '🔵' },
      { id: 'phone_pe', name: 'PhonePe', icon: '🟣' },
      { id: 'paytm', name: 'Paytm', icon: '🔵' },
      { id: 'whatsapp_pay', name: 'WhatsApp Pay', icon: '💚' }
    ];
  }

  // Get payment statistics (admin)
  async getPaymentStats() {
    const totalPayments = await paymentRepository.getPaymentCount('completed');
    const totalRevenue = await paymentRepository.getTotalPayments();
    const pendingCount = await paymentRepository.getPaymentCount('pending');
    const failedCount = await paymentRepository.getPaymentCount('failed');

    return {
      totalPayments,
      totalRevenue,
      pendingCount,
      failedCount
    };
  }

  // Get daily revenue (admin)
  async getDailyRevenue(days = 30) {
    const dailyData = await paymentRepository.getDailyRevenue(days);
    return dailyData;
  }

  // Validate payment method
  isValidPaymentMethod(method) {
    const validMethods = ['card', 'upi', 'netbanking', 'wallet', 'cod'];
    return validMethods.includes(method.toLowerCase());
  }
}

module.exports = new PaymentService();

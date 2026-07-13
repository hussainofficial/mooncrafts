const orderRepository = require('../repositories/order.repository');
const addressRepository = require('../repositories/address.repository');
const productRepository = require('../repositories/product.repository');

class OrderService {
  // Create new order (Guest or Logged In)
  async createOrder(userId, orderData) {
    const { items, shippingAddressId, billingAddressId, paymentMethod, totalAmount, guestEmail, guestPhone, guestName } = orderData;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Check for duplicate orders (within last 5 minutes to prevent accidental duplicates)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    let duplicateOrder = null;

    if (userId) {
      // Check for logged-in user duplicates
      duplicateOrder = await orderRepository.findRecentOrderByUser(userId, fiveMinutesAgo);
    } else if (guestEmail) {
      // Check for guest duplicates
      duplicateOrder = await orderRepository.findRecentOrderByGuestEmail(guestEmail, fiveMinutesAgo);
    }

    if (duplicateOrder) {
      console.warn('⚠️ Duplicate order detected:', duplicateOrder.id);
      throw new Error(`Order already exists (Order ID: ${duplicateOrder.id}). Please wait before placing another order.`);
    }

    // Validate totalAmount
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error('Valid total amount is required');
    }

    // Optional: Validate addresses if provided
    if (shippingAddressId && billingAddressId) {
      const shippingValid = await addressRepository.addressBelongsToUser(shippingAddressId, userId);
      const billingValid = await addressRepository.addressBelongsToUser(billingAddressId, userId);

      if (!shippingValid || !billingValid) {
        console.warn('⚠️ Address validation failed, creating order without addresses');
      }
    }

    // Validate payment method
    if (!paymentMethod || !this.isValidPaymentMethod(paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    console.log('✅ Creating order with validated data');
    console.log('   User ID:', userId || 'Guest');
    console.log('   Guest Email:', guestEmail || 'N/A');
    console.log('   Total Amount:', totalAmount);
    console.log('   Items:', items.length);
    console.log('   Payment Method:', paymentMethod);

    // Create order with validated totalAmount
    const orderId = await orderRepository.createOrder(userId, parseFloat(totalAmount), paymentMethod, guestEmail, guestPhone, guestName);

    // Add order items
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        throw new Error('Invalid order item');
      }

      console.log(`  📦 Adding item: Product ${item.productId}, Qty: ${item.quantity}, Price: ${item.price}`);

      // Verify product exists
      const product = await productRepository.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      await orderRepository.addOrderItem(orderId, item.productId, item.quantity, item.price);
    }

    // Update order with addresses (optional)
    if (shippingAddressId || billingAddressId) {
      console.log('  📍 Updating order addresses...');
      await orderRepository.updateOrderAddresses(orderId, shippingAddressId, billingAddressId);
    }

    console.log('✅ Order created successfully:', orderId);
    return await this.getOrderById(orderId, userId);
  }

  // Get order by ID
  async getOrderById(orderId, userId = null) {
    if (!Number.isInteger(parseInt(orderId))) {
      throw new Error('Invalid order ID');
    }

    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check authorization if userId provided
    if (userId && order.user_id !== userId) {
      throw new Error('Not authorized to view this order');
    }

    const items = await orderRepository.getOrderItems(orderId);
    return { ...order, items };
  }

  // Get user's orders
  async getUserOrders(userId, limit = 20, offset = 0) {
    const orders = await orderRepository.getUserOrders(userId, limit, offset);
    const total = await orderRepository.getUserOrdersCount(userId);

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await orderRepository.getOrderItems(order.id)
      }))
    );

    return {
      orders: ordersWithItems,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get all orders (admin)
  async getAllOrders(limit = 20, offset = 0, filters = {}) {
    let orders;

    if (filters.status) {
      orders = await orderRepository.getOrdersByStatus(filters.status, limit, offset);
    } else {
      orders = await orderRepository.getAllOrders(limit, offset);
    }

    const total = await orderRepository.getOrderCount();

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await orderRepository.getOrderItems(order.id)
      }))
    );

    return {
      orders: ordersWithItems,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await orderRepository.updateOrderStatus(orderId, status);
    return await this.getOrderById(orderId);
  }

  // Cancel order
  async cancelOrder(orderId, userId) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.user_id !== userId) {
      throw new Error('Not authorized to cancel this order');
    }

    const cancelled = await orderRepository.cancelOrder(orderId);
    if (!cancelled) {
      throw new Error('Order cannot be cancelled (must be in pending or processing status)');
    }

    return await this.getOrderById(orderId);
  }

  // Get dashboard statistics
  async getDashboardStats() {
    const totalOrders = await orderRepository.getOrderCount();
    const totalRevenue = await orderRepository.getTotalRevenue();
    const pendingOrders = await orderRepository.getOrdersByStatus('pending');
    const shippedOrders = await orderRepository.getOrdersByStatus('shipped');

    return {
      totalOrders,
      totalRevenue,
      pendingCount: pendingOrders.length,
      shippedCount: shippedOrders.length
    };
  }

  // Validate payment method
  isValidPaymentMethod(method) {
    const validMethods = ['card', 'upi', 'netbanking', 'wallet', 'cod', 'razorpay'];
    return validMethods.includes(method.toLowerCase());
  }
}

module.exports = new OrderService();

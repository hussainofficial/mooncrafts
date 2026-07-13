const { getConnection } = require('../../config/database');

class OrderRepository {
  // Create new order (Guest or Logged In)
  async createOrder(userId, totalAmount, paymentMethod, guestEmail = null, guestPhone = null, guestName = null) {
    const connection = await getConnection();
    try {
      // Validate required parameters
      console.log('📝 Creating order with:', { userId, totalAmount, paymentMethod, guestEmail });

      if (totalAmount === undefined || totalAmount === null) {
        throw new Error('Total amount is required and cannot be undefined');
      }
      if (paymentMethod === undefined || paymentMethod === null) {
        throw new Error('Payment method is required and cannot be undefined');
      }

      // Allow guest checkout (userId can be null for guests)
      if (!userId && !guestEmail) {
        throw new Error('Either user ID or guest email is required');
      }

      let query, params;

      if (userId) {
        // Logged in user
        query = `
          INSERT INTO orders (user_id, total_amount, payment_method, status)
          VALUES (?, ?, ?, 'pending')
        `;
        params = [parseInt(userId), parseFloat(totalAmount), paymentMethod];
        console.log('👤 Logged in user order');
      } else {
        // Guest checkout
        query = `
          INSERT INTO orders (guest_email, guest_phone, guest_name, total_amount, payment_method, status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        params = [guestEmail, guestPhone || null, guestName || null, parseFloat(totalAmount), paymentMethod];
        console.log('👥 Guest order');
      }

      console.log('🔧 Executing with params:', params);
      const [result] = await connection.execute(query, params);
      console.log('✅ Order created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('❌ Error creating order:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Add item to order
  async addOrderItem(orderId, productId, quantity, price) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      await connection.execute(query, [orderId, productId, quantity, price]);
    } finally {
      connection.release();
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          o.*,
          s.name as state_name,
          c.name as city_name,
          ba.full_name as billing_name,
          sa.full_name as shipping_name
        FROM orders o
        LEFT JOIN addresses ba ON o.billing_address_id = ba.id
        LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
        LEFT JOIN states s ON sa.state_id = s.id
        LEFT JOIN cities c ON sa.city_id = c.id
        WHERE o.id = ?
      `;
      const [rows] = await connection.execute(query, [orderId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get order items
  async getOrderItems(orderId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT oi.*, p.name as product_name, p.image as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      const [rows] = await connection.execute(query, [orderId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get user orders
  async getUserOrders(userId, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get all orders (admin)
  async getAllOrders(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
      `;
      await connection.execute(query, [status, orderId]);
    } finally {
      connection.release();
    }
  }

  // Update order with addresses
  async updateOrderAddresses(orderId, shippingAddressId, billingAddressId) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE orders
        SET shipping_address_id = ?, billing_address_id = ?
        WHERE id = ?
      `;
      // Handle null values properly
      const shippingId = shippingAddressId ? parseInt(shippingAddressId) : null;
      const billingId = billingAddressId ? parseInt(billingAddressId) : null;
      await connection.execute(query, [shippingId, billingId, orderId]);
    } finally {
      connection.release();
    }
  }

  // Get order count (admin)
  async getOrderCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM orders';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  // Get total revenue (admin)
  async getTotalRevenue() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT SUM(total_amount) as total_revenue
        FROM orders
        WHERE status IN ('processing', 'shipped', 'delivered')
      `;
      const [rows] = await connection.execute(query);
      return rows[0].total_revenue || 0;
    } finally {
      connection.release();
    }
  }

  // Get orders by status
  async getOrdersByStatus(status) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM orders
        WHERE status = ?
        ORDER BY created_at DESC
      `;
      const [rows] = await connection.execute(query, [status]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Cancel order
  async cancelOrder(orderId) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE orders
        SET status = 'cancelled'
        WHERE id = ? AND status IN ('pending', 'processing')
      `;
      const [result] = await connection.execute(query, [orderId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Get user orders count
  async getUserOrdersCount(userId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?';
      const [rows] = await connection.execute(query, [userId]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  // Get orders by status with pagination
  async getOrdersByStatus(status, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status = ?
        ORDER BY o.created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query, [status]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Find recent order by user (to prevent duplicates)
  async findRecentOrderByUser(userId, afterDate) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id FROM orders
        WHERE user_id = ? AND created_at > ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [userId, afterDate]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Find recent order by guest email (to prevent duplicates)
  async findRecentOrderByGuestEmail(guestEmail, afterDate) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id FROM orders
        WHERE guest_email = ? AND created_at > ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [guestEmail, afterDate]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
}

module.exports = new OrderRepository();

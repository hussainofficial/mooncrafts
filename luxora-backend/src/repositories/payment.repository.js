const { getConnection } = require('../../config/database');

class PaymentRepository {
  // Create payment record
  async createPayment(orderId, amount, paymentMethod, transactionId) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO payments (order_id, amount, payment_method, transaction_id, status)
        VALUES (?, ?, ?, ?, 'pending')
      `;
      const [result] = await connection.execute(query, [orderId, amount, paymentMethod, transactionId]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM payments WHERE id = ?';
      const [rows] = await connection.execute(query, [paymentId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get payment by transaction ID
  async getPaymentByTransactionId(transactionId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM payments WHERE transaction_id = ?';
      const [rows] = await connection.execute(query, [transactionId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM payments WHERE order_id = ?';
      const [rows] = await connection.execute(query, [orderId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Update payment status with Razorpay details
  async updatePaymentStatus(orderId, status, additionalData = {}) {
    const connection = await getConnection();
    try {
      const {
        razorpayPaymentId,
        razorpaySignature,
        gatewayName,
        gatewayResponse,
        failureReason
      } = additionalData;

      let query = `
        UPDATE payments
        SET status = ?
      `;
      const params = [status];

      if (razorpayPaymentId) {
        query += `, transaction_id = ?`;
        params.push(razorpayPaymentId);
      }

      if (gatewayName) {
        query += `, gateway_name = ?`;
        params.push(gatewayName);
      }

      if (gatewayResponse) {
        query += `, gateway_response = ?`;
        params.push(gatewayResponse);
      }

      if (failureReason) {
        query += `, failure_reason = ?`;
        params.push(failureReason);
      }

      if (status === 'completed') {
        query += `, completed_at = NOW()`;
      } else if (status === 'failed') {
        query += `, failed_at = NOW()`;
      }

      query += ` WHERE order_id = ?`;
      params.push(orderId);

      await connection.execute(query, params);
    } finally {
      connection.release();
    }
  }

  // Update payment with Razorpay order ID
  async updatePaymentRazorpayOrderId(orderId, razorpayOrderId) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE payments
        SET gateway_order_id = ?
        WHERE order_id = ?
      `;
      await connection.execute(query, [razorpayOrderId, orderId]);
    } finally {
      connection.release();
    }
  }

  // Update payment by transaction ID
  async updatePaymentByTransactionId(transactionId, status, referenceId = null) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE payments
        SET status = ?, reference_id = ?
        WHERE transaction_id = ?
      `;
      await connection.execute(query, [status, referenceId, transactionId]);
    } finally {
      connection.release();
    }
  }

  // Get user payments
  async getUserPayments(userId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*, o.user_id
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.user_id = ?
        ORDER BY p.created_at DESC
      `;
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get payments by status
  async getPaymentsByStatus(status) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM payments
        WHERE status = ?
        ORDER BY created_at DESC
      `;
      const [rows] = await connection.execute(query, [status]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get total payments
  async getTotalPayments() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT SUM(amount) as total
        FROM payments
        WHERE status = 'completed'
      `;
      const [rows] = await connection.execute(query);
      return rows[0].total || 0;
    } finally {
      connection.release();
    }
  }

  // Get payment count
  async getPaymentCount(status = null) {
    const connection = await getConnection();
    try {
      if (status) {
        const query = 'SELECT COUNT(*) as count FROM payments WHERE status = ?';
        const [rows] = await connection.execute(query, [status]);
        return rows[0].count;
      } else {
        const query = 'SELECT COUNT(*) as count FROM payments';
        const [rows] = await connection.execute(query);
        return rows[0].count;
      }
    } finally {
      connection.release();
    }
  }

  // Get daily revenue
  async getDailyRevenue(days = 30) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(amount) as daily_total
        FROM payments
        WHERE status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      const [rows] = await connection.execute(query, [days]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get user payments count
  async getUserPaymentsCount(userId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.user_id = ?
      `;
      const [rows] = await connection.execute(query, [userId]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  // Get user payments with pagination
  async getUserPayments(userId, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*, o.user_id
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get all payments with pagination
  async getAllPayments(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*, o.user_id, o.total_amount as order_total
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        ORDER BY p.created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = new PaymentRepository();

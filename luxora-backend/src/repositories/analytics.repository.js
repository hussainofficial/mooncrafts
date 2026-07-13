const { getConnection } = require('../../config/database');

class AnalyticsRepository {
  // ============ ORDER ANALYTICS ============

  // Get order statistics
  async getOrderStats() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status='processing' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status='shipped' THEN 1 ELSE 0 END) as shipped,
          SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as totalRevenue,
          AVG(CASE WHEN status != 'cancelled' THEN total_amount ELSE NULL END) as averageOrderValue
        FROM orders
      `;
      const [rows] = await connection.execute(query);
      return rows[0] || {};
    } finally {
      connection.release();
    }
  }

  // ============ PAYMENT ANALYTICS ============

  // Get payment statistics
  async getPaymentStats() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status='refunded' THEN 1 ELSE 0 END) as refunded,
          SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) as totalRevenue,
          SUM(CASE WHEN payment_method='credit_card' THEN 1 ELSE 0 END) as creditCard,
          SUM(CASE WHEN payment_method='debit_card' THEN 1 ELSE 0 END) as debitCard,
          SUM(CASE WHEN payment_method='upi' THEN 1 ELSE 0 END) as upi,
          SUM(CASE WHEN payment_method='wallet' THEN 1 ELSE 0 END) as wallet
        FROM payments
      `;
      const [rows] = await connection.execute(query);
      return rows[0] || {};
    } finally {
      connection.release();
    }
  }

  // Get payment method breakdown
  async getPaymentMethodBreakdown() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM payments
        WHERE status = 'completed'
        GROUP BY payment_method
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get daily revenue for specified days
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

  // ============ PRODUCT ANALYTICS ============

  // Get product statistics
  async getProductStats() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          COUNT(*) as totalProducts,
          SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as inStock,
          SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock,
          SUM(price * stock) as totalInventoryValue,
          AVG(price) as averagePrice,
          MAX(price) as maxPrice,
          MIN(price) as minPrice
        FROM products
      `;
      const [rows] = await connection.execute(query);
      return rows[0] || {};
    } finally {
      connection.release();
    }
  }

  // Get top products by price
  async getTopProductsByPrice(limit = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          id,
          name,
          price,
          stock,
          category_id,
          (CASE WHEN stock > 0 THEN true ELSE false END) as inStock
        FROM products
        ORDER BY price DESC
        LIMIT ?
      `;
      const [rows] = await connection.execute(query, [parseInt(limit)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get top selling products
  async getTopSellingProducts(limit = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          p.id,
          p.name,
          p.price,
          p.stock,
          p.category_id,
          COUNT(oi.id) as totalSold,
          SUM(oi.quantity) as totalQuantity,
          SUM(oi.price * oi.quantity) as totalRevenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id, p.name, p.price, p.stock, p.category_id
        ORDER BY totalQuantity DESC
        LIMIT ?
      `;
      const [rows] = await connection.execute(query, [parseInt(limit)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get low stock products
  async getLowStockProducts(threshold = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          id,
          name,
          price,
          stock,
          category_id
        FROM products
        WHERE stock <= ? AND stock > 0
        ORDER BY stock ASC
      `;
      const [rows] = await connection.execute(query, [threshold]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // ============ USER ANALYTICS ============

  // Get user statistics
  async getUserStats() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN status='banned' THEN 1 ELSE 0 END) as banned,
          SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as adminCount,
          SUM(CASE WHEN role='user' THEN 1 ELSE 0 END) as userCount
        FROM users
      `;
      const [rows] = await connection.execute(query);
      return rows[0] || {};
    } finally {
      connection.release();
    }
  }

  // Get top customers by spending
  async getTopCustomersBySpending(limit = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          u.id,
          u.name,
          u.email,
          COUNT(o.id) as orderCount,
          SUM(o.total_amount) as totalSpent,
          AVG(o.total_amount) as averageOrderValue
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
        GROUP BY u.id, u.name, u.email
        ORDER BY totalSpent DESC
        LIMIT ?
      `;
      const [rows] = await connection.execute(query, [parseInt(limit)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get daily registrations for specified days
  async getDailyRegistrations(days = 30) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as registrations
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      const [rows] = await connection.execute(query, [days]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // ============ CATEGORY ANALYTICS ============

  // Get category performance
  async getCategoryAnalytics() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          c.id,
          c.name,
          COUNT(p.id) as productCount,
          SUM(p.stock) as totalStock,
          SUM(CASE WHEN p.stock > 0 THEN 1 ELSE 0 END) as inStockCount,
          AVG(p.price) as averagePrice,
          SUM(oi.quantity) as totalUnitsSold
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY c.id, c.name
        ORDER BY totalUnitsSold DESC
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // ============ INVENTORY ANALYTICS ============

  // Get inventory value by category
  async getInventoryValueByCategory() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          c.id,
          c.name,
          COUNT(p.id) as productCount,
          SUM(p.stock) as totalUnits,
          SUM(p.price * p.stock) as totalValue,
          AVG(p.price) as averagePrice
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id, c.name
        ORDER BY totalValue DESC
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // ============ SALES ANALYTICS ============

  // Get monthly revenue
  async getMonthlyRevenue(months = 12) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          DATE_FORMAT(o.created_at, '%Y-%m') as month,
          COUNT(o.id) as orderCount,
          SUM(o.total_amount) as totalRevenue,
          AVG(o.total_amount) as averageOrderValue
        FROM orders o
        WHERE o.status != 'cancelled'
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
        ORDER BY month DESC
      `;
      const [rows] = await connection.execute(query, [months]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get conversion metrics
  async getConversionMetrics() {
    const connection = await getConnection();
    try {
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
      const customersQuery = 'SELECT COUNT(DISTINCT user_id) as count FROM orders';

      const [usersResult] = await connection.execute(totalUsersQuery);
      const [customersResult] = await connection.execute(customersQuery);

      const totalUsers = usersResult[0]?.count || 0;
      const totalCustomers = customersResult[0]?.count || 0;

      return {
        totalUsers,
        totalCustomers,
        conversionRate: totalUsers > 0 ? ((totalCustomers / totalUsers) * 100).toFixed(2) : 0
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = new AnalyticsRepository();

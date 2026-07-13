const analyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  // ============ ORDER ANALYTICS ============

  /**
   * Get aggregated order statistics
   * @returns {Promise<Object>} Order statistics including counts by status and revenue
   */
  async getOrderAnalytics() {
    try {
      const stats = await analyticsRepository.getOrderStats();

      // Ensure numeric values
      return {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        processing: parseInt(stats.processing) || 0,
        shipped: parseInt(stats.shipped) || 0,
        delivered: parseInt(stats.delivered) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        averageOrderValue: parseFloat(stats.averageOrderValue) || 0
      };
    } catch (error) {
      throw new Error(`Failed to get order analytics: ${error.message}`);
    }
  }

  // ============ PAYMENT ANALYTICS ============

  /**
   * Get aggregated payment statistics
   * @returns {Promise<Object>} Payment statistics including counts by status and method
   */
  async getPaymentAnalytics() {
    try {
      const stats = await analyticsRepository.getPaymentStats();

      // Ensure numeric values
      return {
        total: parseInt(stats.total) || 0,
        completed: parseInt(stats.completed) || 0,
        pending: parseInt(stats.pending) || 0,
        failed: parseInt(stats.failed) || 0,
        refunded: parseInt(stats.refunded) || 0,
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        paymentMethods: {
          creditCard: parseInt(stats.creditCard) || 0,
          debitCard: parseInt(stats.debitCard) || 0,
          upi: parseInt(stats.upi) || 0,
          wallet: parseInt(stats.wallet) || 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get payment analytics: ${error.message}`);
    }
  }

  /**
   * Get payment method breakdown with detailed metrics
   * @returns {Promise<Array>} Array of payment methods with counts and totals
   */
  async getPaymentMethodBreakdown() {
    try {
      const breakdown = await analyticsRepository.getPaymentMethodBreakdown();

      return breakdown.map(method => ({
        method: method.payment_method,
        count: parseInt(method.count) || 0,
        totalAmount: parseFloat(method.total_amount) || 0,
        averageAmount: parseFloat(method.avg_amount) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get payment method breakdown: ${error.message}`);
    }
  }

  /**
   * Get daily revenue for specified days
   * @param {number} days - Number of days to retrieve
   * @returns {Promise<Array>} Daily revenue data
   */
  async getDailyRevenue(days = 30) {
    try {
      // Validate days parameter
      const validatedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);

      const revenue = await analyticsRepository.getDailyRevenue(validatedDays);

      return revenue.map(entry => ({
        date: entry.date,
        transactionCount: parseInt(entry.transaction_count) || 0,
        dailyTotal: parseFloat(entry.daily_total) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get daily revenue: ${error.message}`);
    }
  }

  // ============ PRODUCT ANALYTICS ============

  /**
   * Get aggregated product statistics
   * @returns {Promise<Object>} Product statistics including stock and pricing info
   */
  async getProductAnalytics() {
    try {
      const stats = await analyticsRepository.getProductStats();

      // Calculate inventory metrics
      const totalProducts = parseInt(stats.totalProducts) || 0;
      const inStock = parseInt(stats.inStock) || 0;
      const outOfStock = parseInt(stats.outOfStock) || 0;

      return {
        totalProducts,
        inStock,
        outOfStock,
        stockPercentage: totalProducts > 0 ? ((inStock / totalProducts) * 100).toFixed(2) : 0,
        totalInventoryValue: parseFloat(stats.totalInventoryValue) || 0,
        averagePrice: parseFloat(stats.averagePrice) || 0,
        maxPrice: parseFloat(stats.maxPrice) || 0,
        minPrice: parseFloat(stats.minPrice) || 0
      };
    } catch (error) {
      throw new Error(`Failed to get product analytics: ${error.message}`);
    }
  }

  /**
   * Get top products by various metrics
   * @param {string} sortBy - Sort metric: 'price', 'sales', 'stock'
   * @param {number} limit - Number of products to retrieve
   * @returns {Promise<Array>} Array of top products
   */
  async getTopProducts(sortBy = 'price', limit = 10) {
    try {
      let products = [];

      switch (sortBy) {
        case 'sales':
          products = await analyticsRepository.getTopSellingProducts(limit);
          return products.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            categoryId: product.category_id,
            totalSold: parseInt(product.totalSold) || 0,
            totalQuantity: parseInt(product.totalQuantity) || 0,
            totalRevenue: parseFloat(product.totalRevenue) || 0
          }));

        case 'stock':
          products = await analyticsRepository.getLowStockProducts(10);
          return products.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            categoryId: product.category_id
          }));

        case 'price':
        default:
          products = await analyticsRepository.getTopProductsByPrice(limit);
          return products.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            categoryId: product.category_id,
            inStock: product.inStock
          }));
      }
    } catch (error) {
      throw new Error(`Failed to get top products: ${error.message}`);
    }
  }

  // ============ USER ANALYTICS ============

  /**
   * Get aggregated user statistics
   * @returns {Promise<Object>} User statistics including counts by status and role
   */
  async getUserAnalytics() {
    try {
      const stats = await analyticsRepository.getUserStats();

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        inactive: parseInt(stats.inactive) || 0,
        banned: parseInt(stats.banned) || 0,
        admins: parseInt(stats.adminCount) || 0,
        regularUsers: parseInt(stats.userCount) || 0
      };
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  /**
   * Get top customers by spending
   * @param {number} limit - Number of customers to retrieve
   * @returns {Promise<Array>} Array of top customers
   */
  async getTopCustomers(limit = 10) {
    try {
      const customers = await analyticsRepository.getTopCustomersBySpending(limit);

      return customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        orderCount: parseInt(customer.orderCount) || 0,
        totalSpent: parseFloat(customer.totalSpent) || 0,
        averageOrderValue: parseFloat(customer.averageOrderValue) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get top customers: ${error.message}`);
    }
  }

  /**
   * Get daily user registrations for specified days
   * @param {number} days - Number of days to retrieve
   * @returns {Promise<Array>} Daily registration data
   */
  async getDailyRegistrations(days = 30) {
    try {
      const validatedDays = Math.min(Math.max(parseInt(days) || 30, 1), 365);
      const registrations = await analyticsRepository.getDailyRegistrations(validatedDays);

      return registrations.map(entry => ({
        date: entry.date,
        registrations: parseInt(entry.registrations) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get daily registrations: ${error.message}`);
    }
  }

  // ============ CATEGORY ANALYTICS ============

  /**
   * Get category performance metrics
   * @returns {Promise<Array>} Array of categories with performance data
   */
  async getCategoryAnalytics() {
    try {
      const categories = await analyticsRepository.getCategoryAnalytics();

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        productCount: parseInt(category.productCount) || 0,
        totalStock: parseInt(category.totalStock) || 0,
        inStockCount: parseInt(category.inStockCount) || 0,
        averagePrice: parseFloat(category.averagePrice) || 0,
        totalUnitsSold: parseInt(category.totalUnitsSold) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get category analytics: ${error.message}`);
    }
  }

  // ============ INVENTORY ANALYTICS ============

  /**
   * Get inventory value by category
   * @returns {Promise<Array>} Array of categories with inventory values
   */
  async getInventoryValueByCategory() {
    try {
      const inventory = await analyticsRepository.getInventoryValueByCategory();

      return inventory.map(category => ({
        id: category.id,
        name: category.name,
        productCount: parseInt(category.productCount) || 0,
        totalUnits: parseInt(category.totalUnits) || 0,
        totalValue: parseFloat(category.totalValue) || 0,
        averagePrice: parseFloat(category.averagePrice) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get inventory value by category: ${error.message}`);
    }
  }

  // ============ SALES ANALYTICS ============

  /**
   * Get monthly revenue
   * @param {number} months - Number of months to retrieve
   * @returns {Promise<Array>} Monthly revenue data
   */
  async getMonthlyRevenue(months = 12) {
    try {
      const validatedMonths = Math.min(Math.max(parseInt(months) || 12, 1), 24);
      const monthlyData = await analyticsRepository.getMonthlyRevenue(validatedMonths);

      return monthlyData.map(entry => ({
        month: entry.month,
        orderCount: parseInt(entry.orderCount) || 0,
        totalRevenue: parseFloat(entry.totalRevenue) || 0,
        averageOrderValue: parseFloat(entry.averageOrderValue) || 0
      }));
    } catch (error) {
      throw new Error(`Failed to get monthly revenue: ${error.message}`);
    }
  }

  /**
   * Get conversion metrics (users to customers)
   * @returns {Promise<Object>} Conversion metrics
   */
  async getConversionMetrics() {
    try {
      const metrics = await analyticsRepository.getConversionMetrics();

      return {
        totalUsers: parseInt(metrics.totalUsers) || 0,
        totalCustomers: parseInt(metrics.totalCustomers) || 0,
        conversionRate: parseFloat(metrics.conversionRate) || 0
      };
    } catch (error) {
      throw new Error(`Failed to get conversion metrics: ${error.message}`);
    }
  }

  // ============ DASHBOARD ANALYTICS ============

  /**
   * Get comprehensive dashboard analytics combining all metrics
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardAnalytics() {
    try {
      const [
        orderStats,
        paymentStats,
        productStats,
        userStats,
        conversionMetrics,
        topProducts,
        topCustomers
      ] = await Promise.all([
        this.getOrderAnalytics(),
        this.getPaymentAnalytics(),
        this.getProductAnalytics(),
        this.getUserAnalytics(),
        this.getConversionMetrics(),
        this.getTopProducts('price', 5),
        this.getTopCustomers(5)
      ]);

      return {
        overview: {
          totalRevenue: orderStats.totalRevenue,
          totalOrders: orderStats.total,
          totalUsers: userStats.total,
          conversionRate: conversionMetrics.conversionRate
        },
        orders: orderStats,
        payments: paymentStats,
        products: productStats,
        users: userStats,
        topProducts,
        topCustomers,
        conversionMetrics
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard analytics: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();

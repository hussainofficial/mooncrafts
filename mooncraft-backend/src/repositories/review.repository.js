const { getConnection } = require('../../config/database');

class ReviewRepository {
  async createReview(orderId, customerName, rating, comment, avatarUrl) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO customer_reviews (order_id, customer_name, rating, comment, avatar_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `;
      const [result] = await connection.execute(query, [orderId, customerName, rating, comment, avatarUrl]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getReviewById(id) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM customer_reviews WHERE id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async hasOrderBeenReviewed(orderId) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM customer_reviews WHERE order_id = ?',
        [orderId]
      );
      return rows[0].count > 0;
    } finally {
      connection.release();
    }
  }

  async getPublicReviews(limit = 10, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id, customer_name, rating, comment, avatar_url, created_at
        FROM customer_reviews
        WHERE status = 'approved'
        ORDER BY created_at DESC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getPublicReviewCount() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM customer_reviews WHERE status = 'approved'"
      );
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async getPendingReviews(limit = 20, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM customer_reviews
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getPendingReviewCount() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM customer_reviews WHERE status = 'pending'"
      );
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async updateReviewStatus(id, status) {
    const connection = await getConnection();
    try {
      await connection.execute(
        'UPDATE customer_reviews SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
    } finally {
      connection.release();
    }
  }
}

module.exports = new ReviewRepository();

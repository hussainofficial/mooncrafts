const { getConnection } = require('../../config/database');

class WishlistRepository {
  async addToWishlist(userId, productId) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO wishlist (user_id, product_id, created_at)
        VALUES (?, ?, NOW())
      `;
      const [result] = await connection.execute(query, [userId, productId]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeFromWishlist(userId, productId) {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async isInWishlist(userId, productId) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      return rows[0].count > 0;
    } finally {
      connection.release();
    }
  }

  async getUserWishlist(userId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT w.id, w.product_id, w.created_at,
               p.name AS product_name, p.image AS product_image, p.price AS product_price
        FROM wishlist w
        LEFT JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
      `;
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = new WishlistRepository();

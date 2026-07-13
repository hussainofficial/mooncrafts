const { getConnection } = require('../../config/database');
const bcrypt = require('bcrypt');

class UserRepository {
  async getUserById(userId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, email, name, phone, role, status, created_at FROM users WHERE id = ?';
      const [rows] = await connection.execute(query, [userId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getUserByEmail(email) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async updateProfile(userId, name, phone) {
    const connection = await getConnection();
    try {
      const query = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
      await connection.execute(query, [name, phone, userId]);
    } finally {
      connection.release();
    }
  }

  async changePassword(userId, newPassword) {
    const connection = await getConnection();
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = 'UPDATE users SET password = ? WHERE id = ?';
      await connection.execute(query, [hashedPassword, userId]);
    } finally {
      connection.release();
    }
  }

  async verifyPassword(userId, plainPassword) {
    const connection = await getConnection();
    try {
      const query = 'SELECT password FROM users WHERE id = ?';
      const [rows] = await connection.execute(query, [userId]);
      if (!rows[0]) return false;

      return await bcrypt.compare(plainPassword, rows[0].password);
    } finally {
      connection.release();
    }
  }

  async getUserStats(userId) {
    const connection = await getConnection();
    try {
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM orders WHERE user_id = ?) as total_orders,
          (SELECT COUNT(*) FROM wishlist WHERE user_id = ?) as wishlist_count,
          (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as review_count,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = ? AND status != 'cancelled') as total_spent
      `;
      const [rows] = await connection.execute(statsQuery, [userId, userId, userId, userId]);
      return rows[0] || {};
    } finally {
      connection.release();
    }
  }

  async getAllUsers(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, email, name, phone, role, status, created_at FROM users LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getUserCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM users';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async findByEmail(email) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async findById(userId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, email, name, phone, role, status, created_at FROM users WHERE id = ?';
      const [rows] = await connection.execute(query, [userId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async emailExists(email) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async createUser(email, passwordHash, name, phone) {
    const connection = await getConnection();
    try {
      const query = 'INSERT INTO users (email, password_hash, name, phone, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
      const [result] = await connection.execute(query, [email, passwordHash, name, phone, 'user', 'active']);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async saveRefreshToken(userId, refreshTokenHash, expiresAt) {
    const connection = await getConnection();
    try {
      const query = 'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, NOW())';
      await connection.execute(query, [userId, refreshTokenHash, expiresAt]);
    } finally {
      connection.release();
    }
  }

  async findRefreshToken(refreshTokenHash) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW()';
      const [rows] = await connection.execute(query, [refreshTokenHash]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async deleteUser(userId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await connection.execute(query, [userId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async updateUser(userId, updateData) {
    const connection = await getConnection();
    try {
      const { name, phone, role, status } = updateData;
      const query = 'UPDATE users SET name = ?, phone = ?, role = ?, status = ?, updated_at = NOW() WHERE id = ?';
      await connection.execute(query, [name, phone, role, status, userId]);
    } finally {
      connection.release();
    }
  }

  async searchUsers(searchTerm, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id, email, name, phone, role, status, created_at, updated_at
        FROM users
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await connection.execute(query, [searchPattern, searchPattern, parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async searchUsersCount(searchTerm) {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE name LIKE ? OR email LIKE ?';
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await connection.execute(query, [searchPattern, searchPattern]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async getUsersByRole(role, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id, email, name, phone, role, status, created_at, updated_at
        FROM users
        WHERE role = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(query, [role, parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getUsersByRoleCount(role) {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE role = ?';
      const [rows] = await connection.execute(query, [role]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async getUsersByStatus(status, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id, email, name, phone, role, status, created_at, updated_at
        FROM users
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(query, [status, parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getUsersByStatusCount(status) {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM users WHERE status = ?';
      const [rows] = await connection.execute(query, [status]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserRepository();

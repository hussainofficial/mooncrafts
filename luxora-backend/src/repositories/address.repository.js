const { getConnection } = require('../../config/database');

class AddressRepository {
  // Create address
  async createAddress(userId, fullName, email, phone, streetAddress, cityId, stateId, postalCode, country = 'India') {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO addresses (user_id, full_name, email, phone, street_address, city_id, state_id, postal_code, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.execute(query, [userId, fullName, email, phone, streetAddress, cityId, stateId, postalCode, country]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Get user addresses
  async getUserAddresses(userId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          a.*,
          s.name as state_name,
          s.code as state_code,
          c.name as city_name
        FROM addresses a
        JOIN states s ON a.state_id = s.id
        JOIN cities c ON a.city_id = c.id
        WHERE a.user_id = ?
        ORDER BY a.is_default DESC, a.created_at DESC
      `;
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get address by ID
  async getAddressById(addressId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          a.*,
          s.name as state_name,
          s.code as state_code,
          c.name as city_name
        FROM addresses a
        JOIN states s ON a.state_id = s.id
        JOIN cities c ON a.city_id = c.id
        WHERE a.id = ?
      `;
      const [rows] = await connection.execute(query, [addressId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get default address
  async getDefaultAddress(userId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          a.*,
          s.name as state_name,
          s.code as state_code,
          c.name as city_name
        FROM addresses a
        JOIN states s ON a.state_id = s.id
        JOIN cities c ON a.city_id = c.id
        WHERE a.user_id = ? AND a.is_default = TRUE
        LIMIT 1
      `;
      const [rows] = await connection.execute(query, [userId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Update address
  async updateAddress(addressId, fullName, email, phone, streetAddress, cityId, stateId, postalCode) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE addresses
        SET full_name = ?, email = ?, phone = ?, street_address = ?, city_id = ?, state_id = ?, postal_code = ?
        WHERE id = ?
      `;
      await connection.execute(query, [fullName, email, phone, streetAddress, cityId, stateId, postalCode, addressId]);
    } finally {
      connection.release();
    }
  }

  // Delete address
  async deleteAddress(addressId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM addresses WHERE id = ?';
      const [result] = await connection.execute(query, [addressId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Set as default
  async setDefaultAddress(userId, addressId) {
    const connection = await getConnection();
    try {
      // Remove default from other addresses
      await connection.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      // Set this as default
      await connection.execute('UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [addressId, userId]);
    } finally {
      connection.release();
    }
  }

  // Check if address belongs to user
  async addressBelongsToUser(addressId, userId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id FROM addresses WHERE id = ? AND user_id = ?';
      const [rows] = await connection.execute(query, [addressId, userId]);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = new AddressRepository();

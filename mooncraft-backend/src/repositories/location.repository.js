const { getConnection } = require('../../config/database');

class LocationRepository {
  // Get all states
  async getAllStates() {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, name, code FROM states ORDER BY name ASC';
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get cities by state ID
  async getCitiesByStateId(stateId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, name, state_id FROM cities WHERE state_id = ? ORDER BY name ASC';
      const [rows] = await connection.execute(query, [stateId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get state by code
  async getStateByCode(code) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, name, code FROM states WHERE code = ?';
      const [rows] = await connection.execute(query, [code.toUpperCase()]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Get city by ID
  async getCityById(cityId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT id, name, state_id FROM cities WHERE id = ?';
      const [rows] = await connection.execute(query, [cityId]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Get all cities
  async getAllCities() {
    const connection = await getConnection();
    try {
      const query = 'SELECT c.id, c.name, s.code as state_code, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY c.name ASC';
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Search cities
  async searchCities(query) {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT c.id, c.name, s.code as state_code, s.name as state_name, s.id as state_id
        FROM cities c
        JOIN states s ON c.state_id = s.id
        WHERE c.name LIKE ? OR s.name LIKE ?
        ORDER BY c.name ASC
        LIMIT 20
      `;
      const searchTerm = `%${query}%`;
      const [rows] = await connection.execute(sql, [searchTerm, searchTerm]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Get state name by ID
  async getStateNameById(stateId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT name, code FROM states WHERE id = ?';
      const [rows] = await connection.execute(query, [stateId]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }
}

module.exports = new LocationRepository();

const { getConnection } = require('../../config/database');

class CollectionRepository {
  async createCollection(name, slug, description, image, is_active) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO collections (name, slug, description, image, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [result] = await connection.execute(query, [name, slug, description, image, is_active ? 1 : 0]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getCollectionById(collectionId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM collections WHERE id = ?';
      const [rows] = await connection.execute(query, [collectionId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getCollectionBySlug(slug) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM collections WHERE slug = ?';
      const [rows] = await connection.execute(query, [slug]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getAllCollections(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM collections
        ORDER BY name ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getCollectionCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM collections';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async updateCollection(collectionId, updateData) {
    const connection = await getConnection();
    try {
      const { name, slug, description, image, is_active } = updateData;
      const query = `
        UPDATE collections
        SET name = ?, slug = ?, description = ?, image = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await connection.execute(query, [name, slug, description, image, is_active ? 1 : 0, collectionId]);
    } finally {
      connection.release();
    }
  }

  async deleteCollection(collectionId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM collections WHERE id = ?';
      await connection.execute(query, [collectionId]);
    } finally {
      connection.release();
    }
  }

  async checkSlugExists(slug, excludeId = null) {
    const connection = await getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM collections WHERE slug = ?';
      const params = [slug];

      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [rows] = await connection.execute(query, params);
      return rows[0].count > 0;
    } finally {
      connection.release();
    }
  }

  async getActiveCollections(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM collections
        WHERE is_active = TRUE
        ORDER BY name ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getActiveCollectionCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM collections WHERE is_active = TRUE';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CollectionRepository();

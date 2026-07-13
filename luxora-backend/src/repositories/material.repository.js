const { getConnection } = require('../../config/database');

class MaterialRepository {
  async createMaterial(name, slug, description, image, is_active) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO materials (name, slug, description, image, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [result] = await connection.execute(query, [name, slug, description, image, is_active ? 1 : 0]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getMaterialById(materialId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM materials WHERE id = ?';
      const [rows] = await connection.execute(query, [materialId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getMaterialBySlug(slug) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM materials WHERE slug = ?';
      const [rows] = await connection.execute(query, [slug]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getAllMaterials(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM materials
        ORDER BY name ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getMaterialCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM materials';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async updateMaterial(materialId, updateData) {
    const connection = await getConnection();
    try {
      const { name, slug, description, image, is_active } = updateData;
      const query = `
        UPDATE materials
        SET name = ?, slug = ?, description = ?, image = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await connection.execute(query, [name, slug, description, image, is_active ? 1 : 0, materialId]);
    } finally {
      connection.release();
    }
  }

  async deleteMaterial(materialId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM materials WHERE id = ?';
      await connection.execute(query, [materialId]);
    } finally {
      connection.release();
    }
  }

  async checkSlugExists(slug, excludeId = null) {
    const connection = await getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM materials WHERE slug = ?';
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

  async getActiveMaterials(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM materials
        WHERE is_active = TRUE
        ORDER BY name ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getActiveMaterialCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM materials WHERE is_active = TRUE';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new MaterialRepository();

const { getConnection } = require('../../config/database');

class CategoryRepository {
  async createCategory(name, description, image, slug) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO categories (name, description, image_url, slug)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await connection.execute(query, [name, description, image, slug]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getCategoryById(categoryId) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM categories WHERE id = ?';
      const [rows] = await connection.execute(query, [categoryId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getCategoryBySlug(slug) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM categories WHERE slug = ?';
      const [rows] = await connection.execute(query, [slug]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getAllCategories(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM categories ORDER BY name ASC LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getCategoriesWithCount(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT ` + parseInt(limit) + ` OFFSET ` + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async updateCategory(categoryId, updateData) {
    const connection = await getConnection();
    try {
      const { name, description, slug, type, is_active } = updateData;
      const query = `
        UPDATE categories
        SET name = ?, description = ?, slug = ?, type = ?, is_active = ?
        WHERE id = ?
      `;
      await connection.execute(query, [name, description, slug, type, is_active ? 1 : 0, categoryId]);
    } finally {
      connection.release();
    }
  }

  async deleteCategory(categoryId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM categories WHERE id = ?';
      await connection.execute(query, [categoryId]);
    } finally {
      connection.release();
    }
  }

  async getAllCategoriesAdmin(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = 'SELECT * FROM categories ORDER BY id DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getCategoryCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM categories';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async checkSlugExists(slug, excludeId = null) {
    const connection = await getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM categories WHERE slug = ?';
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

  async getCategoriesByType(type, limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.type = ?
        GROUP BY c.id
        ORDER BY c.display_order ASC, c.name ASC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(query, [type, parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getCategoriesByTypeCount(type) {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM categories WHERE type = ?';
      const [rows] = await connection.execute(query, [type]);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async getActiveCategories(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY c.display_order ASC, c.name ASC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(query, [parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getActiveCategoriesCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM categories WHERE is_active = TRUE';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}

module.exports = new CategoryRepository();

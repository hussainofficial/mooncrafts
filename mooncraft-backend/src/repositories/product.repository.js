const { getConnection } = require('../../config/database');

class ProductRepository {
  async createProduct(name, description, price, categoryId, imageData, stock, isTrending = false, isNewArrival = false, isBestSeller = false, isFeatured = false, materialId = null) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO products (name, description, price, category_id, material_id, image, stock, status, is_trending, is_new_arrival, is_best_seller, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
      `;
      const [result] = await connection.execute(query, [name, description, price, categoryId, materialId, imageData, stock, isTrending, isNewArrival, isBestSeller, isFeatured]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getProductById(productId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*,
               c.name as category_name,
               m.name as material_name,
               m.id as material_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN materials m ON p.material_id = m.id
        WHERE p.id = ?
      `;
      const [rows] = await connection.execute(query, [productId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  async getAllProducts(limit = 50, offset = 0, filters = {}) {
    const connection = await getConnection();
    try {
      let query = `
        SELECT p.*,
               c.name as category_name,
               m.name as material_name,
               m.id as material_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN materials m ON p.material_id = m.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.categoryId) {
        query += ' AND p.category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters.minPrice) {
        query += ' AND p.price >= ?';
        params.push(filters.minPrice);
      }

      if (filters.maxPrice) {
        query += ' AND p.price <= ?';
        params.push(filters.maxPrice);
      }

      if (filters.search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getProductCount(filters = {}) {
    const connection = await getConnection();
    try {
      let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
      const params = [];

      if (filters.categoryId) {
        query += ' AND category_id = ?';
        params.push(filters.categoryId);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      const [rows] = await connection.execute(query, params);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async updateProduct(productId, name, description, price, categoryId, imageData, stock, status, isTrending = false, isNewArrival = false, isBestSeller = false, isFeatured = false, materialId = null) {
    const connection = await getConnection();
    try {
      const query = `
        UPDATE products
        SET name = ?, description = ?, price = ?, category_id = ?, material_id = ?, image = ?, stock = ?, status = ?, is_trending = ?, is_new_arrival = ?, is_best_seller = ?, is_featured = ?
        WHERE id = ?
      `;
      await connection.execute(query, [name, description, price, categoryId, materialId, imageData, stock, status, isTrending, isNewArrival, isBestSeller, isFeatured, productId]);
    } finally {
      connection.release();
    }
  }

  async deleteProduct(productId) {
    const connection = await getConnection();
    try {
      const query = 'DELETE FROM products WHERE id = ?';
      const [result] = await connection.execute(query, [productId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async getLowStockProducts(threshold = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT * FROM products
        WHERE stock <= ?
        ORDER BY stock ASC
      `;
      const [rows] = await connection.execute(query, [threshold]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async updateStock(productId, quantity) {
    const connection = await getConnection();
    try {
      const query = 'UPDATE products SET stock = stock + ? WHERE id = ?';
      await connection.execute(query, [quantity, productId]);
    } finally {
      connection.release();
    }
  }

  async searchProducts(queryStr, limit = 20) {
    const connection = await getConnection();
    try {
      const sql = `
        SELECT p.*,
               c.name as category_name,
               m.name as material_name,
               m.id as material_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN materials m ON p.material_id = m.id
        WHERE p.name LIKE ? OR p.description LIKE ?
        LIMIT ` + parseInt(limit);
      const [rows] = await connection.execute(sql, [`%${queryStr}%`, `%${queryStr}%`]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getTrendingProducts(limit = 10) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*,
               c.name as category_name,
               m.name as material_name,
               m.id as material_id,
               COUNT(oi.id) as order_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN materials m ON p.material_id = m.id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY order_count DESC
        LIMIT ` + parseInt(limit);
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getProductStats() {
    const connection = await getConnection();
    try {
      const query = `
        SELECT
          COUNT(*) as total_products,
          SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock,
          SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) as low_stock,
          AVG(price) as avg_price,
          MAX(price) as max_price,
          MIN(price) as min_price
        FROM products
      `;
      const [rows] = await connection.execute(query);
      return rows[0];
    } finally {
      connection.release();
    }
  }

  async getTopProducts(limit = 10, sortBy = 'price', order = 'DESC') {
    const connection = await getConnection();
    try {
      // Validate sortBy parameter to prevent SQL injection
      const allowedSortBy = ['price', 'rating', 'reviews', 'stock', 'created_at'];
      const sortField = allowedSortBy.includes(sortBy) ? sortBy : 'price';

      // Validate order parameter
      const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Validate limit
      const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

      const query = `
        SELECT
          p.id,
          p.name,
          p.price,
          p.category_id,
          c.name as category,
          c.name as category_name,
          p.material_id,
          m.name as material_name,
          p.stock,
          p.description,
          p.status,
          p.image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN materials m ON p.material_id = m.id
        WHERE p.status = 'active'
        ORDER BY ${sortField === 'price' ? 'p.price' : sortField === 'stock' ? 'p.stock' : 'p.created_at'} ${orderDirection}
        LIMIT ` + safeLimit;

      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  async updateProductFlags(productId, flags) {
    const connection = await getConnection();
    try {
      const { is_trending, is_new_arrival, is_best_seller, is_featured } = flags;
      const query = `
        UPDATE products
        SET is_trending = ?, is_new_arrival = ?, is_best_seller = ?, is_featured = ?
        WHERE id = ?
      `;
      await connection.execute(query, [
        is_trending ? 1 : 0,
        is_new_arrival ? 1 : 0,
        is_best_seller ? 1 : 0,
        is_featured ? 1 : 0,
        productId
      ]);
    } finally {
      connection.release();
    }
  }

  async getAllProductsWithFlags(limit = 50, offset = 0) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(query, [parseInt(limit), parseInt(offset)]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async getTotalProductCount() {
    const connection = await getConnection();
    try {
      const query = 'SELECT COUNT(*) as count FROM products';
      const [rows] = await connection.execute(query);
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  async updateProductImages(productId, imageUrls) {
    const connection = await getConnection();
    try {
      const imagesJson = JSON.stringify(imageUrls);
      const query = `
        UPDATE products
        SET images = ?
        WHERE id = ?
      `;
      await connection.execute(query, [imagesJson, productId]);
    } finally {
      connection.release();
    }
  }

  // NEW: Product Images Table Methods

  async addProductImage(productId, imageUrl, displayOrder = 1, altText = null) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO product_images (product_id, image_url, display_order, alt_text)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await connection.execute(query, [productId, imageUrl, displayOrder, altText]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async addProductImages(productId, images) {
    const connection = await getConnection();
    try {
      const query = `
        INSERT INTO product_images (product_id, image_url, display_order, alt_text)
        VALUES (?, ?, ?, ?)
      `;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await connection.execute(query, [
          productId,
          image.url || image.image_url,
          image.display_order || (i + 1),
          image.alt_text || null
        ]);
      }

      return true;
    } finally {
      connection.release();
    }
  }

  async getProductImages(productId) {
    const connection = await getConnection();
    try {
      const query = `
        SELECT id, product_id, image_url, display_order, alt_text, created_at
        FROM product_images
        WHERE product_id = ?
        ORDER BY display_order ASC
      `;
      const [rows] = await connection.execute(query, [productId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  async deleteProductImage(imageId) {
    const connection = await getConnection();
    try {
      const query = `
        DELETE FROM product_images
        WHERE id = ?
      `;
      const [result] = await connection.execute(query, [imageId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async updateImageOrder(productId, images) {
    const connection = await getConnection();
    try {
      for (const image of images) {
        const query = `
          UPDATE product_images
          SET display_order = ?, alt_text = ?
          WHERE id = ? AND product_id = ?
        `;
        await connection.execute(query, [image.display_order, image.alt_text || null, image.id, productId]);
      }
      return true;
    } finally {
      connection.release();
    }
  }

  async deleteProductImages(productId) {
    const connection = await getConnection();
    try {
      const query = `
        DELETE FROM product_images
        WHERE product_id = ?
      `;
      await connection.execute(query, [productId]);
      return true;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ProductRepository();

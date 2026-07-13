const productRepository = require('../repositories/product.repository');
const { MESSAGES } = require('../../config/constants');

class ProductService {
  async createProduct(name, description, price, categoryId, imageUrl, imageFileName, stock) {
    if (!name || !price || !categoryId) {
      throw new Error('Name, price, and category are required');
    }

    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    const productId = await productRepository.createProduct(
      name,
      description,
      price,
      categoryId,
      imageUrl,
      imageFileName,
      stock || 0
    );

    return { id: productId, name, description, price, categoryId };
  }

  async getProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getAllProducts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const products = await productRepository.findAll(limit, offset);
    const total = await productRepository.getTotal();

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductsByCategory(categoryId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const products = await productRepository.findByCategory(categoryId, limit, offset);

    return {
      data: products,
      pagination: {
        page,
        limit,
      },
    };
  }

  async updateProduct(productId, name, description, price, categoryId, stock) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (price && price < 0) {
      throw new Error('Price cannot be negative');
    }

    await productRepository.updateProduct(
      productId,
      name || product.name,
      description || product.description,
      price || product.price,
      categoryId || product.category_id,
      stock !== undefined ? stock : product.stock
    );

    return { id: productId, success: true };
  }

  async updateProductImage(productId, imageUrl, imageFileName) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await productRepository.updateProductImage(productId, imageUrl, imageFileName);
    return { id: productId, success: true };
  }

  async deleteProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await productRepository.deleteProduct(productId);
    return { success: true, message: 'Product deleted successfully' };
  }
}

module.exports = new ProductService();

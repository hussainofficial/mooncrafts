const productRepository = require('../repositories/product.repository');

class ProductFlagsService {
  async updateProductFlags(productId, flags) {
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const updateData = {
      is_trending: flags.is_trending !== undefined ? flags.is_trending : product.is_trending,
      is_new_arrival: flags.is_new_arrival !== undefined ? flags.is_new_arrival : product.is_new_arrival,
      is_best_seller: flags.is_best_seller !== undefined ? flags.is_best_seller : product.is_best_seller,
      is_featured: flags.is_featured !== undefined ? flags.is_featured : product.is_featured
    };

    await productRepository.updateProductFlags(productId, updateData);
    return await this.getProductFlags(productId);
  }

  async getProductFlags(productId) {
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return {
      productId: product.id,
      productName: product.name,
      is_trending: product.is_trending || false,
      is_new_arrival: product.is_new_arrival || false,
      is_best_seller: product.is_best_seller || false,
      is_featured: product.is_featured || false
    };
  }

  async getAllProductsWithFlags(limit = 20, offset = 0) {
    const products = await productRepository.getAllProductsWithFlags(limit, offset);
    const total = await productRepository.getTotalProductCount();

    return {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category_name: p.category_name,
        is_trending: p.is_trending || false,
        is_new_arrival: p.is_new_arrival || false,
        is_best_seller: p.is_best_seller || false,
        is_featured: p.is_featured || false
      })),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = new ProductFlagsService();

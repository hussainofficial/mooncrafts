const wishlistRepository = require('../repositories/wishlist.repository');
const productRepository = require('../repositories/product.repository');

class WishlistService {
  async addToWishlist(userId, productId) {
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const alreadyExists = await wishlistRepository.isInWishlist(userId, productId);
    if (alreadyExists) {
      throw new Error('Product already in wishlist');
    }

    const id = await wishlistRepository.addToWishlist(userId, productId);
    return { id, message: 'Added to wishlist' };
  }

  async removeFromWishlist(userId, productId) {
    const removed = await wishlistRepository.removeFromWishlist(userId, productId);
    if (!removed) {
      throw new Error('Item not found in wishlist');
    }
    return { message: 'Removed from wishlist' };
  }

  async getUserWishlist(userId) {
    return await wishlistRepository.getUserWishlist(userId);
  }
}

module.exports = new WishlistService();

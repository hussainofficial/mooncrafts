const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const wishlistService = require('../services/wishlist.service');

async function addToWishlist(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { productId } = req.body;

    const result = await wishlistService.addToWishlist(userId, productId);

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      id: result.id
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: error.message });
    }
    if (error.message === 'Product already in wishlist') {
      return res.status(STATUS_CODES.CONFLICT).json({ success: false, message: error.message });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const result = await wishlistService.removeFromWishlist(userId, productId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === 'Item not found in wishlist') {
      return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: error.message });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getUserWishlist(req, res, next) {
  try {
    const userId = req.user.userId;
    const wishlist = await wishlistService.getUserWishlist(userId);

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
};

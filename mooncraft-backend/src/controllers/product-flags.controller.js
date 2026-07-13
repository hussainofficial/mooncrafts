const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const productFlagsService = require('../services/product-flags.service');

async function updateProductFlags(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const { is_trending, is_new_arrival, is_best_seller, is_featured } = req.body;

    const result = await productFlagsService.updateProductFlags(productId, {
      is_trending,
      is_new_arrival,
      is_best_seller,
      is_featured
    });

    res.json({
      success: true,
      message: 'Product flags updated successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getProductFlags(req, res, next) {
  try {
    const { productId } = req.params;

    const flags = await productFlagsService.getProductFlags(productId);

    res.json({
      success: true,
      data: flags
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getAllProductsWithFlags(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await productFlagsService.getAllProductsWithFlags(limit, offset);

    res.json({
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateProductFlags,
  getProductFlags,
  getAllProductsWithFlags
};

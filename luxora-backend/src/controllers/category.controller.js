const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const categoryService = require('../services/category.service');

async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, image, slug, type } = req.body;

    const result = await categoryService.createCategory({
      name,
      slug,
      description,
      type
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      categoryId: result.categoryId
    });
  } catch (error) {
    if (error.message.includes('Slug already exists')) {
      return res.status(STATUS_CODES.CONFLICT).json({
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

async function listCategories(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await categoryService.getAllCategories(limit, offset);

    res.json({
      success: true,
      data: result.categories,
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

async function getCategory(req, res, next) {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.message === 'Category not found') {
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

async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const category = await categoryService.getCategoryBySlug(slug);

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.message === 'Category not found') {
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

async function updateCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { categoryId } = req.params;
    const { name, description, image, slug, type, is_active } = req.body;

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      name,
      slug,
      description,
      type,
      is_active
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Slug already exists')) {
      return res.status(STATUS_CODES.CONFLICT).json({
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

async function deleteCategory(req, res, next) {
  try {
    const { categoryId } = req.params;

    const result = await categoryService.deleteCategory(categoryId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

async function getCategoriesByType(req, res, next) {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await categoryService.getCategoriesByType(type, limit, offset);

    res.json({
      success: true,
      data: result.categories,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: result.pages
      }
    });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getActiveCategories(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await categoryService.getActiveCategories(limit, offset);

    res.json({
      success: true,
      data: result.categories,
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

async function getAllCategoriesAdmin(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await categoryService.getAllCategories(limit, offset);

    res.json({
      success: true,
      data: result.categories,
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
  createCategory,
  listCategories,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  getActiveCategories,
  getAllCategoriesAdmin
};

const express = require('express');
const { param, body, query } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public endpoints
router.get('/', categoryController.listCategories);

router.get(
  '/active/list',
  categoryController.getActiveCategories
);

router.get(
  '/by-type/:type',
  [param('type').isIn(['material', 'type', 'collection'])],
  categoryController.getCategoriesByType
);

router.get(
  '/by-slug/:slug',
  [param('slug').isString()],
  categoryController.getCategoryBySlug
);

router.get(
  '/:categoryId',
  [param('categoryId').isInt()],
  categoryController.getCategory
);

// Admin endpoints
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('name').notEmpty().isLength({ min: 2 }),
    body('slug').notEmpty().isSlug(),
    body('description').optional(),
    body('type').isIn(['material', 'type', 'collection'])
  ],
  categoryController.createCategory
);

router.put(
  '/:categoryId',
  authMiddleware,
  adminMiddleware,
  [
    param('categoryId').isInt(),
    body('name').optional().isLength({ min: 2 }),
    body('slug').optional().isSlug(),
    body('description').optional(),
    body('type').optional().isIn(['material', 'type', 'collection']),
    body('is_active').optional().isBoolean()
  ],
  categoryController.updateCategory
);

router.delete(
  '/:categoryId',
  authMiddleware,
  adminMiddleware,
  [param('categoryId').isInt()],
  categoryController.deleteCategory
);

router.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  categoryController.getAllCategoriesAdmin
);

module.exports = router;

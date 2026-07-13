const express = require('express');
const { param, body, query } = require('express-validator');
const materialController = require('../controllers/material.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public endpoints
router.get('/', materialController.listMaterials);

router.get(
  '/active/list',
  materialController.getActiveMaterials
);

router.get(
  '/by-slug/:slug',
  [param('slug').isString()],
  materialController.getMaterialBySlug
);

router.get(
  '/:materialId',
  [param('materialId').isInt()],
  materialController.getMaterial
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
    body('image').optional().isString(),
    body('is_active').optional().isBoolean()
  ],
  materialController.createMaterial
);

router.put(
  '/:materialId',
  authMiddleware,
  adminMiddleware,
  [
    param('materialId').isInt(),
    body('name').optional().isLength({ min: 2 }),
    body('slug').optional().isSlug(),
    body('description').optional(),
    body('image').optional().isString(),
    body('is_active').optional().isBoolean()
  ],
  materialController.updateMaterial
);

router.delete(
  '/:materialId',
  authMiddleware,
  adminMiddleware,
  [param('materialId').isInt()],
  materialController.deleteMaterial
);

module.exports = router;

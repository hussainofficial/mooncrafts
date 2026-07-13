const express = require('express');
const { param, body, query } = require('express-validator');
const collectionController = require('../controllers/collection.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public endpoints
router.get('/', collectionController.listCollections);

router.get(
  '/active/list',
  collectionController.getActiveCollections
);

router.get(
  '/by-slug/:slug',
  [param('slug').isString()],
  collectionController.getCollectionBySlug
);

router.get(
  '/:collectionId',
  [param('collectionId').isInt()],
  collectionController.getCollection
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
  collectionController.createCollection
);

router.put(
  '/:collectionId',
  authMiddleware,
  adminMiddleware,
  [
    param('collectionId').isInt(),
    body('name').optional().isLength({ min: 2 }),
    body('slug').optional().isSlug(),
    body('description').optional(),
    body('image').optional().isString(),
    body('is_active').optional().isBoolean()
  ],
  collectionController.updateCollection
);

router.delete(
  '/:collectionId',
  authMiddleware,
  adminMiddleware,
  [param('collectionId').isInt()],
  collectionController.deleteCollection
);

module.exports = router;

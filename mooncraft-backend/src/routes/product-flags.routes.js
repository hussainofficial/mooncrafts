const express = require('express');
const { param, body } = require('express-validator');
const productFlagsController = require('../controllers/product-flags.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin endpoints only
router.get(
  '/all',
  authMiddleware,
  adminMiddleware,
  productFlagsController.getAllProductsWithFlags
);

router.put(
  '/:productId/flags',
  authMiddleware,
  adminMiddleware,
  [
    param('productId').isInt(),
    body('is_trending').optional().isBoolean(),
    body('is_new_arrival').optional().isBoolean(),
    body('is_best_seller').optional().isBoolean(),
    body('is_featured').optional().isBoolean()
  ],
  productFlagsController.updateProductFlags
);

router.get(
  '/:productId/flags',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt()],
  productFlagsController.getProductFlags
);

module.exports = router;

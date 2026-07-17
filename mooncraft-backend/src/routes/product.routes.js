const express = require('express');
const { param, body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public endpoints
router.get('/', productController.listProducts);
router.get('/search', productController.searchProducts);

// Product Gallery Routes (must come BEFORE generic /:productId)
router.get(
  '/:productId/gallery',
  [param('productId').isInt()],
  productController.getProductGallery
);

router.get('/:productId/image', [param('productId').isInt()], productController.getProductImage);
router.get('/:productId', [param('productId').isInt()], productController.getProduct);

// Admin endpoints

// Image upload endpoint
router.post(
  '/:productId/upload-images',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt()],
  upload.array('images', 5), // Accept up to 5 images
  productController.uploadProductImages
);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('name').notEmpty().isLength({ min: 2 }).trim().escape(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('categoryId').isInt(),
    body('materialId').optional().isInt(),
    body('image').optional().isString(),
    body('stock').isInt({ min: 0 })
  ],
  productController.createProduct
);

router.put(
  '/:productId',
  authMiddleware,
  adminMiddleware,
  [
    param('productId').isInt(),
    body('name').optional().isLength({ min: 2 }).trim().escape(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('categoryId').optional().isInt(),
    body('image').optional().isString(),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().trim()
  ],
  productController.updateProduct
);

router.delete(
  '/:productId',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt()],
  productController.deleteProduct
);

router.get('/admin/low-stock', authMiddleware, adminMiddleware, productController.getLowStockProducts);
router.get('/admin/stats', authMiddleware, adminMiddleware, productController.getProductStats);
router.get('/admin/analytics', authMiddleware, adminMiddleware, productController.getProductStats);
router.get('/admin/top-products', authMiddleware, adminMiddleware, productController.getTopProducts);

// Product Gallery Images Routes (POST, PUT, DELETE)
router.post(
  '/:productId/gallery',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt()],
  productController.addProductGalleryImages
);

router.put(
  '/:productId/gallery',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt()],
  productController.updateProductGalleryImageOrder
);

router.delete(
  '/:productId/gallery/:imageId',
  authMiddleware,
  adminMiddleware,
  [param('productId').isInt(), param('imageId').isInt()],
  productController.deleteProductGalleryImage
);

module.exports = router;

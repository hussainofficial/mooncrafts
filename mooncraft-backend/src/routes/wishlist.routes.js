const express = require('express');
const { param, body } = require('express-validator');
const wishlistController = require('../controllers/wishlist.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

router.get('/', wishlistController.getUserWishlist);

router.post(
  '/',
  [body('productId').notEmpty().isInt()],
  wishlistController.addToWishlist
);

router.delete(
  '/:productId',
  [param('productId').isInt()],
  wishlistController.removeFromWishlist
);

module.exports = router;

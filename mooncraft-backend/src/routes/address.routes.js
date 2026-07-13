const express = require('express');
const { param, body } = require('express-validator');
const addressController = require('../controllers/address.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all user addresses
router.get('/', addressController.getUserAddresses);

// Get default address
router.get('/default', addressController.getDefaultAddress);

// Create new address
router.post(
  '/',
  [
    body('fullName').notEmpty().isLength({ min: 2 }),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('streetAddress').notEmpty().isLength({ min: 5 }),
    body('cityId').isInt(),
    body('stateId').isInt(),
    body('postalCode').notEmpty(),
    body('country').optional()
  ],
  addressController.createAddress
);

// Get address by ID
router.get(
  '/:addressId',
  [param('addressId').isInt()],
  addressController.getAddressById
);

// Update address
router.put(
  '/:addressId',
  [
    param('addressId').isInt(),
    body('fullName').notEmpty().isLength({ min: 2 }),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('streetAddress').notEmpty().isLength({ min: 5 }),
    body('cityId').isInt(),
    body('stateId').isInt(),
    body('postalCode').notEmpty()
  ],
  addressController.updateAddress
);

// Delete address
router.delete(
  '/:addressId',
  [param('addressId').isInt()],
  addressController.deleteAddress
);

// Set as default
router.put(
  '/:addressId/default',
  [param('addressId').isInt()],
  addressController.setDefaultAddress
);

module.exports = router;

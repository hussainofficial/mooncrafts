const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public endpoints
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'User service is running' });
});

// User endpoints (protected)
router.get('/profile', authMiddleware, userController.getProfile);

router.put(
  '/profile',
  authMiddleware,
  [
    body('fullName').optional().isLength({ min: 2 }),
    body('phone').optional(),
    body('profileImage').optional()
  ],
  userController.updateProfile
);

router.put(
  '/password',
  authMiddleware,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').notEmpty().isLength({ min: 6 })
  ],
  userController.changePassword
);

// Get single user (admin or self)
router.get(
  '/:userId',
  authMiddleware,
  [param('userId').isInt()],
  userController.getSingleUser
);

// Update user (admin only)
router.put(
  '/:userId',
  authMiddleware,
  adminMiddleware,
  [
    param('userId').isInt(),
    body('name').optional().isLength({ min: 2 }),
    body('phone').optional(),
    body('role').optional().isIn(['user', 'admin']),
    body('status').optional().isIn(['active', 'inactive', 'banned'])
  ],
  userController.updateUser
);

// Delete user (admin only)
router.delete(
  '/:userId',
  authMiddleware,
  adminMiddleware,
  [param('userId').isInt()],
  userController.deleteUser
);

// Admin endpoints
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  userController.getAllUsers
);

router.get(
  '/admin/search',
  authMiddleware,
  adminMiddleware,
  [query('q').trim().isLength({ min: 2 })],
  userController.searchUsers
);

router.get(
  '/admin/by-role',
  authMiddleware,
  adminMiddleware,
  [query('role').isIn(['user', 'admin'])],
  userController.getUsersByRole
);

router.get(
  '/admin/by-status',
  authMiddleware,
  adminMiddleware,
  [query('status').isIn(['active', 'inactive', 'banned'])],
  userController.getUsersByStatus
);

router.get(
  '/admin/analytics',
  authMiddleware,
  adminMiddleware,
  userController.getAllUsers
);

module.exports = router;

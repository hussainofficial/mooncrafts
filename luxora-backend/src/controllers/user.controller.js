const { validationResult } = require('express-validator');
const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const userService = require('../services/user.service');
const userRepository = require('../repositories/user.repository');

// Get current user profile
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    const stats = await userRepository.getUserStats(userId);

    res.json({
      success: true,
      user: {
        ...user,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get single user (admin or self)
async function getSingleUser(req, res, next) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Allow users to view their own profile or admins to view any profile
    if (userId !== currentUserId.toString() && !isAdmin) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN
      });
    }

    const user = await userService.getUserById(userId);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

// Update current user profile
async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { fullName, phone, profileImage } = req.body;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    await userRepository.updateProfile(userId, fullName, phone, profileImage);
    const updatedUser = await userService.getUserById(userId);

    res.json({
      success: true,
      message: MESSAGES.USER_UPDATED,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Update user (admin endpoint)
async function updateUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { name, phone, role, status } = req.body;

    const updatedUser = await userService.updateUser(userId, {
      name,
      phone,
      role,
      status
    });

    res.json({
      success: true,
      message: MESSAGES.USER_UPDATED,
      user: updatedUser
    });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
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

// Change password
async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    const isValidPassword = await userRepository.verifyPassword(userId, currentPassword);
    if (!isValidPassword) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (newPassword.length < 6) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    await userRepository.changePassword(userId, newPassword);

    res.json({
      success: true,
      message: MESSAGES.PASSWORD_UPDATED
    });
  } catch (error) {
    next(error);
  }
}

// Get all users (admin)
async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await userService.getAllUsers(limit, offset);

    res.json({
      success: true,
      data: result.users,
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

// Delete user (admin)
async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;

    const result = await userService.deleteUser(userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

// Search users (admin)
async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Search term must be at least 2 characters'
      });
    }

    const result = await userService.searchUsers(q, limit, offset);

    res.json({
      success: true,
      data: result.users,
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

// Get users by role (admin)
async function getUsersByRole(req, res, next) {
  try {
    const { role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await userService.getUsersByRole(role, limit, offset);

    res.json({
      success: true,
      data: result.users,
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

// Get users by status (admin)
async function getUsersByStatus(req, res, next) {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await userService.getUsersByStatus(status, limit, offset);

    res.json({
      success: true,
      data: result.users,
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

module.exports = {
  getProfile,
  getSingleUser,
  updateProfile,
  updateUser,
  changePassword,
  getAllUsers,
  deleteUser,
  searchUsers,
  getUsersByRole,
  getUsersByStatus
};

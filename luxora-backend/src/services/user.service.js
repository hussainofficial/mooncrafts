const userRepository = require('../repositories/user.repository');
const { hashPassword } = require('../utils/hash');
const { MESSAGES } = require('../../config/constants');

class UserService {
  // Get user by ID
  async getUserById(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  // Get all users with pagination
  async getAllUsers(limit = 20, offset = 0) {
    const users = await userRepository.getAllUsers(limit, offset);
    const total = await userRepository.getUserCount();

    return {
      users: users.map(u => this.sanitizeUser(u)),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Update user profile
  async updateUser(userId, updateData) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const { name, phone, role, status } = updateData;

    if (name && name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (phone && !/^[0-9\-\+\s]+$/.test(phone)) {
      throw new Error('Invalid phone number format');
    }

    if (role && !['user', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    if (status && !['active', 'inactive', 'banned'].includes(status)) {
      throw new Error('Invalid status');
    }

    await userRepository.updateUser(userId, {
      name: name || user.name,
      phone: phone || user.phone,
      role: role || user.role,
      status: status || user.status
    });

    return await this.getUserById(userId);
  }

  // Delete user
  async deleteUser(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    await userRepository.deleteUser(userId);
    return { message: MESSAGES.USER_DELETED };
  }

  // Get user statistics
  async getUserStats(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const stats = await userRepository.getUserStats(userId);
    return stats;
  }

  // Search users
  async searchUsers(searchTerm, limit = 20, offset = 0) {
    const users = await userRepository.searchUsers(searchTerm, limit, offset);
    const total = await userRepository.searchUsersCount(searchTerm);

    return {
      users: users.map(u => this.sanitizeUser(u)),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get users by role
  async getUsersByRole(role, limit = 20, offset = 0) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role');
    }

    const users = await userRepository.getUsersByRole(role, limit, offset);
    const total = await userRepository.getUsersByRoleCount(role);

    return {
      users: users.map(u => this.sanitizeUser(u)),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get users by status
  async getUsersByStatus(status, limit = 20, offset = 0) {
    if (!['active', 'inactive', 'banned'].includes(status)) {
      throw new Error('Invalid status');
    }

    const users = await userRepository.getUsersByStatus(status, limit, offset);
    const total = await userRepository.getUsersByStatusCount(status);

    return {
      users: users.map(u => this.sanitizeUser(u)),
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Sanitize user object (remove sensitive data)
  sanitizeUser(user) {
    const { password, password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new UserService();

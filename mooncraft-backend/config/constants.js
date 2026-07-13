module.exports = {
  // User Roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned',
  },

  // API Response Messages
  MESSAGES: {
    SUCCESS: 'Operation successful',
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    PASSWORD_UPDATED: 'Password updated successfully',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    BAD_REQUEST: 'Bad request',
    SERVER_ERROR: 'Internal server error',
  },

  // Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
};

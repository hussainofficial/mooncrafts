const { verifyAccessToken } = require('../utils/jwt');
const { STATUS_CODES, MESSAGES } = require('../../config/constants');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.INVALID_TOKEN,
    });
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    req.user = verifyAccessToken(token);
  } catch (error) {
    // Invalid/expired token on an optional-auth route: proceed as guest instead of rejecting.
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.UNAUTHORIZED,
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(STATUS_CODES.FORBIDDEN).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware };

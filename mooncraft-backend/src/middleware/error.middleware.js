const { STATUS_CODES, MESSAGES } = require('../../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message.includes('Invalid or expired')) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: MESSAGES.SERVER_ERROR,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorHandler;

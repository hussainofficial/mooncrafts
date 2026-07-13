const authService = require('../services/auth.service');
const { STATUS_CODES, MESSAGES } = require('../../config/constants');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.BAD_REQUEST,
          errors: errors.array(),
        });
      }

      const { email, password, name, phone } = req.body;
      const result = await authService.register(email, password, name, phone);

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.USER_CREATED,
        data: result,
      });
    } catch (error) {
      if (error.message === MESSAGES.EMAIL_ALREADY_EXISTS) {
        return res.status(STATUS_CODES.CONFLICT).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.BAD_REQUEST,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
        data: result,
      });
    } catch (error) {
      if (error.message === MESSAGES.INVALID_CREDENTIALS) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMe(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await authService.getUserProfile(userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.SUCCESS,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const { MESSAGES } = require('../../config/constants');
const crypto = require('crypto');

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const GENERIC_RESET_MESSAGE = 'If that email is registered, a password reset link has been sent.';

class AuthService {
  async register(email, password, name, phone) {
    const emailExists = await userRepository.emailExists(email);
    if (emailExists) {
      throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await hashPassword(password);
    const userId = await userRepository.createUser(email, passwordHash, name, phone);

    const accessToken = generateAccessToken(userId, email, 'user');
    const refreshToken = generateRefreshToken(userId);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(userId, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name, phone },
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const tokenRecord = await userRepository.findRefreshToken(refreshTokenHash);
    if (!tokenRecord) {
      throw new Error(MESSAGES.INVALID_TOKEN);
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    return { accessToken: newAccessToken };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async forgotPassword(email) {
    const user = await userRepository.getUserByEmail(email);

    // Anti-enumeration: always behave the same whether or not the user exists.
    if (!user) {
      return { message: GENERIC_RESET_MESSAGE };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await userRepository.setPasswordResetToken(user.id, hashedToken, expiresAt);

    const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:4200';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return { message: GENERIC_RESET_MESSAGE };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.resetPassword(user.id, passwordHash);

    return { message: 'Password has been reset successfully.' };
  }
}

module.exports = new AuthService();

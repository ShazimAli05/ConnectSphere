const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'connectsphere_super_secret_jwt_key_2026_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {string} userId
 * @returns {string} JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Attach JWT token cookie to response
 * @param {Object} res - Express response
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear token cookie on logout
 * @param {Object} res - Express response
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

module.exports = {
  JWT_SECRET,
  generateToken,
  setTokenCookie,
  clearTokenCookie,
};

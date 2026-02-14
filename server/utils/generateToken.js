const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // Use environment variable or fallback to a default secret for development
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

module.exports = generateToken;

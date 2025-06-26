import jwt from 'jsonwebtoken';

export default class TokenService {
  constructor(config = {}) {
    if (!config.secret) {
      throw new Error('JWT secret is required');
    }
    this.secret = config.secret;
    this.accessExpiry = config.accessExpiry || '15m';
    this.refreshExpiry = config.refreshExpiry || '7d';
  }

  generateAccessToken(userId) {
    if (!userId) throw new Error('userId is required');
    return jwt.sign({ sub: userId }, this.secret, {
      expiresIn: this.accessExpiry
    });
  }

  generateRefreshToken(userId) {
    if (!userId) throw new Error('userId is required');
    return jwt.sign({ sub: userId }, this.secret, {
      expiresIn: this.refreshExpiry
    });
  }

  verifyToken(token) {
    if (!token) {
      throw new Error('Invalid or expired token'); // Updated error message
    }
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }

  decodeToken(token) {
    if (!token) return null;
    return jwt.decode(token);
  }
}
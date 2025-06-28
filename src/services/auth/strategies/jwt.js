import jwt from 'jsonwebtoken';
import config from '../../../../config/auth.js';

export const generateVerificationToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
};

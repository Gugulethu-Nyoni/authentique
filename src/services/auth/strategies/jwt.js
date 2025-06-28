import jwt from 'jsonwebtoken';
import config from '../../../../config/auth.js';

export const generateVerificationToken = (payload) => {
  const expiresIn = '24h';
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn });

  // Calculate expiration timestamp (in JS Date or ISO string)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  return { token, expiresAt };
};

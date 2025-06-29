import jwt from 'jsonwebtoken';
import config from '../../../../config/auth.js';

export const generateVerificationToken = (payload) => {
  const expiresIn = '24h';
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn,
    issuer: 'authentique',
    audience: 'ui-server'
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expiresAt };
};

export const generateAuthToken = (payload) => {
  console.log('[generateAuthToken] Signing payload:', payload);
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1d',
    issuer: 'authentique',
    audience: 'ui-server'
  });
};

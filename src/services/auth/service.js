import { findUserByEmail, createUser } from '../../models/user.js';
import { hashPassword } from '../password.js';
import { generateVerificationToken } from './strategies/jwt.js';

export const signupUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error('Email is already registered.');

  const password_hash = await hashPassword(password);
  const verification_token = generateVerificationToken({ email });

  const verification_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const userId = await createUser({
    name,
    email,
    password_hash,
    verification_token,
    verification_token_expires_at
  });

  return { userId, verification_token };
};

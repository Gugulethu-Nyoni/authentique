import { findUserByEmail, createUser } from '../../models/user.js';
import { hashPassword } from '../password.js';
import { generateVerificationToken } from './strategies/jwt.js';

export const signupUser = async ({ name, email, password }) => {
  console.log('[signupUser] Starting signup for:', email);

  // 1. Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    console.log('[signupUser] Email already registered:', email);
    throw new Error('Email is already registered.');
  }

  // 2. Hash the password
  const password_hash = await hashPassword(password);
  console.log('[signupUser] Password hashed');

  // 3. Generate verification token and expiry
  const { token, expiresAt } = generateVerificationToken({ email });
  console.log('[signupUser] Generated token:', token, 'Expires at:', expiresAt);

  // 4. Create user in DB
  const user = await createUser({
    name,
    email,
    password_hash,
    verification_token: token,
    verification_token_expires_at: expiresAt
  });
  console.log('[signupUser] User created with id:', user);

  // 5. Return relevant info (do NOT send email here)
  return {
    verification_token: token,
    email,
    name
  };
};

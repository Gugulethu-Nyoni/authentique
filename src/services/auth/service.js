// src/services/auth/service.js

import { findUserByEmail, createUser } from '../../models/user.js';
import { hashPassword } from '../password.js';
import { generateVerificationToken } from './strategies/jwt.js';
import { emailService } from '../email.js';

export const signupUser = async ({ name, email, password }) => {
  // 1. Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error('Email is already registered.');

  // 2. Hash the password
  const password_hash = await hashPassword(password);

  // 3. Generate verification token and expiry
  const { token, expiresAt } = generateVerificationToken({ email });

  // 4. Create user in DB
  const user = await createUser({
    name,
    email,
    password_hash,
    verification_token: token,
    verification_token_expires_at: expiresAt
  });

  // 5. Send confirmation email via email service
  await emailService.sendConfirmationEmail({
    to: user.email,
    name: user.name,
    token: token
  });

  // 6. Return new user (or a success response)
  return user;
};

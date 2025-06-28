import { signupUser } from '../../services/auth/service.js';
import { emailService } from '../../services/email.js';
import { successResponse, errorResponse } from '../utils/response.js';
import jwt from 'jsonwebtoken';
import config from '../../../config/auth.js';
import { findUserByVerificationToken, verifyUserById } from '../../models/user.js';

// Signup Handler
export const signupHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 'All fields are required.', 400);
    }

    const { verification_token } = await signupUser({ name, email, password });

    await emailService.sendConfirmationEmail({
      to: email,
      name,
      token: verification_token
    });

    return successResponse(
      res,
      'Account created. Please check your email to verify.',
      { token: verification_token },
      200
    );

  } catch (err) {
    console.error(err);
    return errorResponse(res, err.message || 'Signup failed.', 500);
  }
};

// Confirm Email Handler
export const confirmEmailHandler = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return errorResponse(res, 'Verification token missing.', 400);
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, config.jwtSecret);
    const email = decoded.email;

    // Find user by token (from DB)
    const user = await findUserByVerificationToken(token);
    if (!user) {
      return errorResponse(res, 'Invalid or expired token.', 400);
    }

    if (user.is_verified) {
      return successResponse(res, 'Email already verified.', null, 200);
    }

    // Mark user as verified in DB
    await verifyUserById(user.id);

    return successResponse(res, 'Email verified successfully.', null, 200);

  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Invalid or expired token.', 400);
  }
};

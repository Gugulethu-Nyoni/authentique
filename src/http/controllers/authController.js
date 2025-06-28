import { signupUser } from '../../services/auth/service.js';
import { loginUser } from '../../services/auth/service.js';
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



export const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    console.log(`Login attempt for email: ${email}`);

    const { user, token } = await loginUser({ email, password });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false, // HTTPS only in prod
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    };

    console.log('Setting auth_token cookie with options:', cookieOptions);

    // Set HTTP-only cookie with JWT token for security
    res.cookie('auth_token', token, cookieOptions);

    return successResponse(res, 'Login successful.', { user });

  } catch (err) {
    console.error('Login error:', err);

    if (err.message === 'Invalid email or password') {
      return errorResponse(res, err.message, 401);
    }

    return errorResponse(res, err.message || 'Login failed.', 500);
  }
};

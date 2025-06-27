// http/services/auth-service.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../database.js';
import { emailService } from '../../services/email-service.js';
import { config } from '../../../config.js';

export default class AuthService {
  static async signup(email, password, name) {
    // 1. Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      throw { status: 409, message: 'Email already in use' };
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user with confirmation token
    const confirmationToken = jwt.sign(
      { email, purpose: 'confirmation' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, name, verification_token, is_verified) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, confirmationToken, false]
    );

    // 4. Send confirmation email (fire-and-forget)
    try {
      await emailService.sendConfirmationEmail({
        to: email,
        name,
        token: confirmationToken
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue anyway - we can resend later
    }

    return {
      id: result.insertId,
      email,
      name,
      isConfirmed: false
    };
  }

  static async login(email, password) {
    // 1. Find user
    const [users] = await db.query(
      `SELECT id, email, name, password_hash, is_verified 
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    
    if (users.length === 0) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    const user = users[0];

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    // 3. Check if email is confirmed
    if (!user.is_verified) {
      throw { 
        status: 403, 
        message: 'Email not confirmed',
        code: 'EMAIL_NOT_CONFIRMED'
      };
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }


  static async confirmEmail(token) {
  const baseResponse = {
    success: false,
    message: '',
    status: 500,
    code: 'UNKNOWN_ERROR'
  };

  try {
    console.log('Starting confirmEmail with token:', token);

    // Validate token exists
    if (!token) {
      console.log('No token provided');
      return {
        success: false,
        message: 'Missing verification token',
        status: 400,
        code: 'MISSING_TOKEN'
      };
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
      console.log('Decoded token:', decoded);
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError);
      return {
        success: false,
        message: jwtError.name === 'TokenExpiredError' 
          ? 'Verification link expired' 
          : 'Invalid verification link',
        status: jwtError.name === 'TokenExpiredError' ? 410 : 400,
        code: jwtError.name
      };
    }

    // Validate token structure
    if (!decoded.email) {
      console.log('Decoded token missing email field');
      return {
        success: false,
        message: 'Invalid token format',
        status: 400,
        code: 'INVALID_TOKEN_FORMAT'
      };
    }

    // Database operations: Check if user exists
    const [users] = await db.query(
      `SELECT is_verified FROM users WHERE email = ?`,
      [decoded.email]
    ).catch((dbErr) => {
      console.error('DB query error (SELECT):', dbErr);
      return [[]];
    });

    console.log('User lookup result:', users);

    if (!users.length) {
      console.log('No user found for email:', decoded.email);
      return {
        success: false,
        message: 'Account not found',
        status: 404,
        code: 'USER_NOT_FOUND'
      };
    }

    if (users[0].is_verified) {
      console.log('Email already verified for:', decoded.email);
      return {
        success: true,
        message: 'Email already verified',
        status: 200,
        code: 'ALREADY_VERIFIED'
      };
    }

    // Update verification status
    const [result] = await db.query(
      `UPDATE users SET is_verified = true WHERE email = ?`,
      [decoded.email]
    ).catch((dbErr) => {
      console.error('DB query error (UPDATE):', dbErr);
      return [{ affectedRows: 0 }];
    });

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      console.log('Update failed for email:', decoded.email);
      return {
        success: false,
        message: 'Verification failed',
        status: 500,
        code: 'UPDATE_FAILED'
      };
    }

    // Success case
    console.log('Email verified successfully for:', decoded.email);
    return {
      success: true,
      message: 'Email verified successfully',
      status: 200,
      code: 'VERIFICATION_SUCCESS'
    };

  } catch (error) {
    console.error('Verification process error:', error);
    return {
      ...baseResponse,
      message: 'Internal server error',
      status: 500,
      code: 'INTERNAL_ERROR'
    };
  }
}




  static async resendConfirmation(email) {
    const [users] = await db.query(
      `SELECT id, name, is_verified FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    
    if (users.length === 0) {
      throw { status: 404, message: 'Email not found' };
    }

    if (users[0].is_verified) {
      throw { status: 400, message: 'Email already confirmed' };
    }

    const newToken = jwt.sign(
      { email, purpose: 'confirmation' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    await db.query(
      `UPDATE users SET verification_token = ? WHERE email = ?`,
      [newToken, email]
    );

    await emailService.sendConfirmationEmail({
      to: email,
      name: users[0].name,
      token: newToken
    });
    
    return { success: true };
  }
}
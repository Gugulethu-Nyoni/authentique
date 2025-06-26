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
      await emailService.sendConfirmationEmail(email, confirmationToken);
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
      config.jwtSecret,
      { expiresIn: '7d' } // Longer expiry for better UX
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
    try {
      const { email } = jwt.verify(token, config.jwtSecret);
      
      const [result] = await db.query(
        `UPDATE users 
         SET is_verified = true, verification_token = NULL
         WHERE email = ? AND verification_token = ?`,
        [email, token]
      );
      
      if (result.affectedRows === 0) {
        throw { status: 404, message: 'Token not found or already used' };
      }

      return { success: true };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw { status: 410, message: 'Confirmation link expired' };
      }
      throw { status: 400, message: 'Invalid token' };
    }
  }

  static async resendConfirmation(email) {
    const [users] = await db.query(
      `SELECT id, is_verified FROM users WHERE email = ? LIMIT 1`,
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
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    await db.query(
      `UPDATE users SET verification_token = ? WHERE email = ?`,
      [newToken, email]
    );

    await EmailService.sendConfirmationEmail(email, newToken);
    
    return { success: true };
  }
}
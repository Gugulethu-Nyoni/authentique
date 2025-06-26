// Import bcryptjs (pure JS implementation for wider compatibility)
/**
 * 
 */


import bcrypt from 'bcryptjs';

export default class PasswordService {
  constructor(config = {}) {
    // Configurable security parameters
    this.saltRounds = config.saltRounds || 12;
    this.minPasswordLength = config.minPasswordLength || 8;
    this.requireSpecialChar = config.requireSpecialChar ?? true;
  }

  /**
   * Hashes a plain text password
   * @param {string} plainTextPassword 
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(plainTextPassword) {
    if (!plainTextPassword?.trim()) {
      throw new Error('Password cannot be empty');
    }
    return await bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  /**
   * Compares a plain text password with a hash
   * @param {string} plainTextPassword 
   * @param {string} hash 
   * @returns {Promise<boolean>} Match result
   */
  async comparePassword(plainTextPassword, hash) {
    if (!plainTextPassword || !hash) {
      return false;
    }
    return await bcrypt.compare(plainTextPassword, hash);
  }

  /**
   * Checks if password meets complexity requirements
   * @param {string} password 
   * @returns {boolean} Validity result
   */
  meetsRequirements(password) {
    const hasMinLength = password.length >= this.minPasswordLength;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = this.requireSpecialChar 
      ? /[!@#$%^&*(),.?":{}|<>]/.test(password) 
      : true;

    return (
      hasMinLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  }
}
import PasswordService from '../lib/core/password-service.js';
import { describe, it, expect } from '@jest/globals';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  it('should hash and compare passwords correctly', async () => {
    const plain = "SecurePass123!";
    const hash = await passwordService.hashPassword(plain);
    
    // Test correct password
    expect(await passwordService.comparePassword(plain, hash)).toBe(true);
    
    // Test incorrect password
    expect(await passwordService.comparePassword('wrong', hash)).toBe(false);
  });

  it('should enforce password requirements', () => {
    // Test weak password
    expect(passwordService.meetsRequirements("Weak")).toBe(false);
    
    // Test strong password
    expect(passwordService.meetsRequirements("StrongPass123!")).toBe(true);
  });

  it('should reject empty passwords', async () => {
    await expect(passwordService.hashPassword(''))
      .rejects
      .toThrow('Password cannot be empty');
  });
});
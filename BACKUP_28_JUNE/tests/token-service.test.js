import TokenService from '../lib/core/token-service.js';
import { describe, it, expect } from '@jest/globals';

describe('TokenService', () => {
  const tokenService = new TokenService({ 
    secret: 'test-secret-123',
    accessExpiry: '1h',
    refreshExpiry: '7d'
  });

  // ... (keep other tests the same)

  it('should reject invalid tokens', () => {
    const testCases = [
      { token: 'malformed.token.here', description: 'malformed token' },
      { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', description: 'tampered token' },
      { token: null, description: 'null token' },
      { token: undefined, description: 'undefined token' },
      { token: '', description: 'empty string token' }
    ];

    testCases.forEach(({ token, description }) => {
      expect(() => tokenService.verifyToken(token)).toThrow('Invalid or expired token');
    });
  });
});
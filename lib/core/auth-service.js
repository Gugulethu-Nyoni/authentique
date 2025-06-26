import PasswordService from './password-service.js';
import TokenService from './token-service.js';

export default class AuthService {
  constructor({ dbAdapter, emailAdapter, secret }) {
    this.db = dbAdapter;
    this.email = emailAdapter;
    this.passwordService = new PasswordService();
    this.tokenService = new TokenService({ secret });
  }

  async register({ email, password }) {
    // 1. Validate input
    // 2. Hash password
    // 3. Create user in DB
    // 4. Send verification email
    // 5. Return user + token
  }

  async login({ email, password }) {
    // 1. Find user in DB
    // 2. Verify password
    // 3. Generate tokens
    // 4. Return user + token
  }
}
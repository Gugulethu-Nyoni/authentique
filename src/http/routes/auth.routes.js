import express from 'express';
import { 
  signupHandler,
  confirmEmailHandler,
  loginHandler,
  validateSessionHandler,
  verifyTokenHandler,
  logoutHandler,
  getUserProfileHandler,
  forgotPasswordHandler,
  resetPasswordHandler
} from '../controllers/authController.js';

import { authenticateToken } from '../middleware/authenticate.js'; // <-- Correct Import Path

const router = express.Router();

// Signup route
router.post('/api/signup', signupHandler);

// Email confirmation route
router.post('/auth/confirm', confirmEmailHandler);

// Login route
router.post('/api/login', loginHandler);

// NEW: Logout route
router.post('/api/logout', logoutHandler); // Or router.get('/api/logout', logoutHandler); if you prefer GET

// ✅ NEW: Forgot password (request reset link)
router.post('/api/forgot-password', forgotPasswordHandler);

// ✅ NEW: Reset password (with token)
router.post('/api/reset-password', resetPasswordHandler);




router.use(authenticateToken); // <-- Apply here
// BELOW ARE ROUTES THAT REQUIRE (use) authenticateToken

// Session validation (existing)
router.get('/api/validate-session', validateSessionHandler);
// NEW: Token verification endpoint for UI proxy
router.get('/api/verify-token', verifyTokenHandler);
router.get('/api/user/profile', getUserProfileHandler); // This route MUST be protected by a middleware!

export default router;
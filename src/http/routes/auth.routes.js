import express from 'express';
import { signupHandler, confirmEmailHandler,loginHandler } from '../controllers/authController.js';

const router = express.Router();

// Signup route
router.post('/api/signup', signupHandler);

// Email confirmation route
router.post('/auth/confirm', confirmEmailHandler);

//login route
router.post('/api/login', loginHandler);

export default router;

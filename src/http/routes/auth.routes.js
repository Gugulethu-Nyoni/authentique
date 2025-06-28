import express from 'express';
import { signupHandler, confirmEmailHandler } from '../controllers/authController.js';

const router = express.Router();

// Signup route
router.post('/api/signup', signupHandler);

// Email confirmation route
router.post('/auth/confirm', confirmEmailHandler);

export default router;

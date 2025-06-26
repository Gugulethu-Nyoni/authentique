import express from 'express';
import AuthService from '../lib/core/auth-service.js';
import TokenService from '../lib/core/token-service.js';

const router = express.Router();

// Local Auth
router.post('/signup', async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    const token = TokenService.generateAccessToken(user.id);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Password Reset Flow
router.post('/forgot-password', async (req, res) => {
  try {
    await AuthService.sendPasswordReset(req.body.email);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
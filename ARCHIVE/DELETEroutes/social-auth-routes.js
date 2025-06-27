import express from 'express';
import SocialAuthService from '../lib/core/social-auth-service.js';
import passport from 'passport';
import { OAuthStateManager } from '../lib/utils/oauth-state-manager.js';

const router = express.Router();

// State management setup
const stateManager = new OAuthStateManager();

/**
 * @route GET /auth/social/:provider
 * @desc Initiate social auth flow
 * @param {string} provider - One of: github, google, facebook, twitter
 */
router.get('/:provider', (req, res, next) => {
  const { provider } = req.params;
  const state = stateManager.generateState();
  
  passport.authenticate(provider, {
    session: false,
    state,
    scope: ['profile', 'email'] // Provider-specific scopes
  })(req, res, next);
});

/**
 * @route GET /auth/social/:provider/callback
 * @desc Handle social auth callback
 */
router.get('/:provider/callback', 
  (req, res, next) => {
    passport.authenticate(req.params.provider, {
      session: false,
      failureRedirect: '/login?error=social_auth_failed'
    }, (err, user, info) => {
      // Verify state first
      if (!stateManager.validateState(req.query.state)) {
        return res.redirect('/login?error=invalid_state');
      }

      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.redirect('/login?error=authentication_failed');
      }

      // Successful authentication
      req.logIn(user, { session: false }, (err) => {
        if (err) return next(err);
        
        // Generate tokens or session
        const token = TokenService.generateAccessToken(user.id);
        res.redirect(`/auth/success?token=${token}`);
      });
    })(req, res, next);
  }
);

/**
 * @route POST /auth/social/link
 * @desc Link social account to existing user
 */
router.post('/link', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { provider, accessToken } = req.body;
      const user = await SocialAuthService.linkAccount(
        req.user.id, 
        provider, 
        accessToken
      );
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @route POST /auth/social/unlink
 * @desc Unlink social account
 */
router.post('/unlink', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { provider } = req.body;
      const user = await SocialAuthService.unlinkAccount(
        req.user.id, 
        provider
      );
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
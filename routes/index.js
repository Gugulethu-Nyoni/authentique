import authRoutes from './auth-routes.js';
import socialAuthRoutes from './social-auth-routes.js';

export default (app) => {
  app.use('/auth', authRoutes);
  app.use('/auth/social', socialAuthRoutes);
};
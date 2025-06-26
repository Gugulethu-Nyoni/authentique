import { signupHandler, loginHandler } from '../controllers/auth.js';

export const authRoutes = {
  'POST /auth/signup': signupHandler,
  'POST /auth/login': loginHandler,
  // Add more auth routes as needed
};

// Helper function to register all auth routes
export function registerAuthRoutes(routesMap) {
  return {
    ...routesMap,
    ...authRoutes
  };
}
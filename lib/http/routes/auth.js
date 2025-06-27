import { signupHandler, loginHandler, confirmHandler } from '../controllers/auth.js';

export const authRoutes = {
  'POST /auth/signup': signupHandler,
  'POST /auth/login': loginHandler,
  'POST /auth/confirm': confirmHandler, 
  // Add more auth routes as needed
};

// Helper function to register all auth routes
export function registerAuthRoutes(routesMap) {
  const allRoutes = {
    ...routesMap,
    ...authRoutes
  };
  console.log('Registered auth routes:', Object.keys(allRoutes));
  return allRoutes;
}

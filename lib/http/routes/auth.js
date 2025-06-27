import { 
  signupHandler, 
  loginHandler, 
  confirmHandler,
  dashboardHandler,
  accountHandler
} from '../controllers/auth.js';

export const authRoutes = {
  'POST /auth/signup': signupHandler,
  'POST /auth/login': loginHandler,
  'POST /auth/confirm': confirmHandler,
  // Add these new protected routes:
  'GET /api/dashboard': dashboardHandler,
  'GET /api/account': accountHandler,
  'POST /api/account/update': accountHandler,
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
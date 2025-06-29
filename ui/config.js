// config.js - Environment and Base URLs configs
const AppConfig = {
  // Auto-detect environment (or manually set: 'development'/'production')
  ENV: window.location.hostname.includes('localhost') ? 'development' : 'production',
  
  // Base URLs
  BASE_URLS: {
    development: 'http://localhost:3000',      // Dev API
    production: 'https://api.botaniqsa.com'    // Live API (use HTTPS!)
  },
  
  // Get current base URL
  get BASE_URL() {
    return this.BASE_URLS[this.ENV] || this.BASE_URLS.development; // Fallback to dev
  }
};

export default AppConfig;
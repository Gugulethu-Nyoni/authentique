const AppConfig = {
  ENV: (typeof window !== 'undefined' && window.location.hostname.includes('localhost'))
    ? 'development'
    : 'production',

  BASE_URLS: {
    development: 'http://localhost:3000',
    production: 'https://api.botaniqsa.com'
  },

  get BASE_URL() {
    return this.BASE_URLS[this.ENV] || this.BASE_URLS.development;
  }
};

export default AppConfig;

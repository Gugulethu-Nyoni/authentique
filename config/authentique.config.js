import databaseConfig from '../config/databases.js';
import emailConfig from '../config/auth.js';

export default {
  database: {
    adapter: 'mysql',
    config: databaseConfig['mysql']
  },
  email: {
    provider: 'Resend',
    config: emailConfig
  },
  features: {
    ui: true
  }
};

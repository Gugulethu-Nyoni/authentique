import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';


export const config = {
  // Core
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  baseUrl: process.env.BASE_URL || (isProd ? 'https://app.botaniqsa.com' : 'http://localhost:3000'),

brand: {
    name: process.env.BRAND_NAME || 'Botaniq',
    supportEmail: process.env.BRAND_SUPPORT_EMAIL || 'support@botaniqsa.com'
  },
  // Database
  db: {
    adapter: process.env.DB_ADAPTER || 'mysql',
    mysql: {
      host: process.env.DB_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.DB_MYSQL_PORT || '3306'),
      user: process.env.DB_MYSQL_USER || 'root',
      password: process.env.DB_MYSQL_PASSWORD || '',
      name: process.env.DB_MYSQL_NAME || 'test_auth',
      pool: {
        limit: parseInt(process.env.DB_MYSQL_POOL_LIMIT || '10')
      }
    },
    sqlite: {
      path: process.env.DB_SQLITE_PATH || './data/auth.db'
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY
    },
    mongodb: {
      uri: process.env.MONGO_URI
    }
  },

  // Auth (unchanged)
  // process.env.JWT_SECRET || 'dev-secret-64-chars-minimum-xxxx
  
  jwt: {
    secret:'KtrDWbW96NhNRyfyM72hQ1SGDV+IxULuevzTPSJPn7ajEKYWBAV4087shzhaNO/BoW0ByCkGANwpijAPtxXlnA==',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: '7d'
  },

  // Email (unchanged)
  email: {
    driver: process.env.EMAIL_DRIVER || 'resend',
    from: process.env.EMAIL_FROM || (isProd ? 'noreply@sender.formiquejs.com' : 'dev@localhost'),
    fromName: process.env.EMAIL_FROM_NAME || 'BOTANIQ Auth',
    resend: {
      apiKey: process.env.RESEND_API_KEY
    },
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
};

// Validation (updated for DB_MYSQL_ prefix)
const required = {
  production: ['JWT_SECRET', 'DB_MYSQL_PASSWORD'],
  all: []
};

if (config.email.driver === 'resend') required.all.push('RESEND_API_KEY');
if (config.db.adapter === 'mysql') required.all.push('DB_MYSQL_HOST', 'DB_MYSQL_USER');
if (config.db.adapter === 'supabase') required.all.push('SUPABASE_URL', 'SUPABASE_KEY');

[...required.all, ...(required[config.env] || [])].forEach(varName => {
  if (!process.env[varName]) throw new Error(`${varName} is required`);
});
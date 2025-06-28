#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const questions = [
  {
    type: 'list',
    name: 'database',
    message: 'Choose your database:',
    choices: ['MySQL', 'Supabase', 'SQLite', 'MongoDB'],
    default: process.env.DB_ADAPTER 
      ? process.env.DB_ADAPTER.charAt(0).toUpperCase() + process.env.DB_ADAPTER.slice(1)
      : 'MySQL'
  },
  {
    type: 'list',
    name: 'emailService',
    message: 'Select email provider:',
    choices: ['Resend', 'Mailgun', 'SMTP', 'Sendgrid', 'None'],
    default: process.env.EMAIL_DRIVER 
      ? process.env.EMAIL_DRIVER.charAt(0).toUpperCase() + process.env.EMAIL_DRIVER.slice(1)
      : 'Resend'
  },
  {
    type: 'confirm',
    name: 'includeUI',
    message: 'Include built-in auth UI?',
    default: true
  }
];

async function generateConfig(answers) {
  // Create config directory if needed
  await fs.mkdir(path.join(process.cwd(), 'config'), { recursive: true });

  // Generate master config
  const config = {
    database: {
      adapter: answers.database.toLowerCase(),
      config: `config/databases.js`  // Matches your existing structure
    },
    email: {
      provider: answers.emailService,
      config: `config/auth.js`  // Matches your existing structure
    },
    features: {
      ui: answers.includeUI
    }
  };

  // Write config files that work with your .env
  await Promise.all([
    fs.writeFile(
      path.join(process.cwd(), 'config', 'authentique.config.js'),
      `export default ${JSON.stringify(config, null, 2)}`
    ),
    fs.writeFile(
      path.join(process.cwd(), 'config', 'databases.js'),
      `export default {
        ${answers.database.toLowerCase()}: {
          host: process.env.DB_MYSQL_HOST,
          port: process.env.DB_MYSQL_PORT,
          user: process.env.DB_MYSQL_USER,
          password: process.env.DB_MYSQL_PASSWORD,
          database: process.env.DB_MYSQL_NAME,
          poolLimit: process.env.DB_MYSQL_POOL_LIMIT
        }
      }`
    ),
    fs.writeFile(
      path.join(process.cwd(), 'config', 'auth.js'),
      `export default {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiry: process.env.JWT_ACCESS_EXPIRY,
        emailDriver: process.env.EMAIL_DRIVER,
        ${answers.emailService.toLowerCase()}: {
          ${answers.emailService === 'Resend' ? 
            'apiKey: process.env.RESEND_API_KEY' :
            answers.emailService === 'Mailgun' ?
            'apiKey: process.env.MAILGUN_API_KEY\ndomain: process.env.MAILGUN_DOMAIN' :
            '/* Configure your email provider */'
          }
        }
      }`
    )
  ]);

  console.log(`
  ✅ Configuration complete!
  
  Generated files:
  - config/authentique.config.js (Main config)
  - config/databases.js (DB connection)
  - config/auth.js (Auth settings)

  Using environment variables from your .env file
  `);
}

// Verify .env exists first
fs.access(path.join(process.cwd(), '.env'))
  .then(() => inquirer.prompt(questions).then(generateConfig))
  .catch(() => {
    console.error('Error: .env file not found. Please create it first.');
    process.exit(1);
  });
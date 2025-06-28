#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';

const questions = [
  {
    type: 'list',
    name: 'database',
    message: 'Choose your database:',
    choices: ['MySQL', 'Supabase', 'SQLite', 'MongoDB']
  },
  {
    type: 'list',
    name: 'emailService',
    message: 'Select email provider:',
    choices: ['Resend', 'Mailgun', 'SMTP','Sendgrid','None']
  },
  {
    type: 'confirm',
    name: 'includeUI',
    message: 'Include built-in auth UI?',
    default: true
  }
];

async function generateConfig(answers) {
  const config = {
    database: {
      adapter: answers.database.toLowerCase(),
      configFile: `config/database.${answers.database.toLowerCase()}.js`
    },
    email: {
      provider: answers.emailService,
      configPath: answers.emailService !== 'None' ? 
        `config/email.${answers.emailService.toLowerCase()}.js` : null
    },
    features: {
      ui: answers.includeUI
    }
  };

  await fs.writeFile(
    path.join(process.cwd(), 'config', 'authentique.config.js'),
    `export default ${JSON.stringify(config, null, 2)}`
  );
  console.log('✅ Config generated at config/authentique.config.js');
}

inquirer.prompt(questions).then(generateConfig);
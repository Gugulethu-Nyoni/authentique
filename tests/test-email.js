import '../utils/env-loader.js';  // MUST be first import

// Add this right after your env-loader import
console.log('Environment variables loaded:', process.env.DB_MYSQL_HOST ? 'Yes' : 'No');


import { EmailService } from '../lib/services/email-service.js';

const emailService = new EmailService();

console.log('DB_MYSQL_HOST:', process.env.DB_MYSQL_HOST);

async function testEmail() {
  try {
    const testRecipient = process.env.TEST_RECIPIENT_EMAIL || 'youremail@example.com';
    const token = 'test-confirmation-token';

    const result = await emailService.sendConfirmationEmail(testRecipient, token);
    console.log('✅ Email send result:', result);
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
}

testEmail();

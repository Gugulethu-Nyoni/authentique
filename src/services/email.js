import config from '../../config/authentique.config.js';
import { Resend } from 'resend';
import mailgunJs from 'mailgun-js';
import nodemailer from 'nodemailer';

// Driver Implementations remain unchanged
class ResendDriver {
  constructor({ apiKey }) {
    this.resend = new Resend(apiKey);
  }

  async send({ from, to, subject, html, text }) {
    return this.resend.emails.send({ from, to, subject, html, text });
  }
}

class MailgunDriver {
  constructor({ apiKey, domain }) {
    this.mailgun = mailgunJs({ apiKey, domain });
  }

  async send({ from, to, subject, html, text }) {
    return this.mailgun.messages().send({ from, to, subject, html, text });
  }
}

class SMTPDriver {
  constructor(options) {
    this.transporter = nodemailer.createTransport(options);
  }

  async send({ from, to, subject, html, text }) {
    return this.transporter.sendMail({ from, to, subject, html, text });
  }
}

class MockEmailDriver {
  async send(email) {
    console.log('[Mock Email] Would send:', email);
    return { id: 'mock-id' };
  }
}

export class EmailService {
  constructor() {
    this.driver = this._initDriver();
  }

  _initDriver() {
    switch (config.email.config.driver) {
      case 'resend':
        return new ResendDriver(config.email.config.resend);
      case 'mailgun':
        return new MailgunDriver(config.email.config.mailgun);
      case 'smtp':
        return new SMTPDriver(config.email.config.smtp);
      case 'mock':
        return new MockEmailDriver();
      default:
        throw new Error(`Unsupported email driver: ${config.email.config.driver}`);
    }
  }

  async sendConfirmationEmail({ to, name, token }) {
    const confirmationUrl = `${config.baseUrl}/auth/confirm?token=${token}`;
    const subject = `Confirm Your ${config.brand.name} Account`;

    const html = this._generateConfirmationTemplate({
      name,
      brandName: config.brand.name,
      supportEmail: config.brand.supportEmail,
      confirmationUrl,
      year: new Date().getFullYear()
    });

    return this.driver.send({
      from: `${config.email.config.fromName} <${config.email.config.from}>`,
      to,
      subject,
      html,
      text: `Hi ${name}, please confirm your email by visiting: ${confirmationUrl}`
    });
  }

  _generateConfirmationTemplate({ name, brandName, supportEmail, confirmationUrl, year }) {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          margin: 15px 0;
        }
        .footer { margin-top: 20px; font-size: 12px; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hi ${name},</h1>
        <p>Welcome to <strong>${brandName}</strong>! We're excited to have you on board.</p>
        
        <p>To complete your registration, please confirm your email address by clicking the button below:</p>
        
        <p>
          <a href="${confirmationUrl}" class="button">Confirm Email</a>
        </p>
        
        <p>Or copy and paste this link into your browser:<br>
          <a href="${confirmationUrl}">${confirmationUrl}</a>
        </p>
        
        <p>If you didn't create an account with ${brandName}, you can safely ignore this email.</p>
        
        <div class="footer">
          <p>Need help? Contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
          <p>&copy; ${year} ${brandName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;
  }
}

export const emailService = new EmailService();

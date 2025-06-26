import { config } from '../../config.js';
import { Resend } from 'resend';
import mailgunJs from 'mailgun-js';
import nodemailer from 'nodemailer';

// Driver Implementations
class ResendDriver {
  constructor({ apiKey }) {
    this.resend = new Resend(apiKey);
  }

  async send({ from, to, subject, html }) {
    return this.resend.emails.send({ from, to, subject, html });
  }
}

class MailgunDriver {
  constructor({ apiKey, domain }) {
    this.mailgun = mailgunJs({ apiKey, domain });
  }

  async send({ from, to, subject, html }) {
    return this.mailgun.messages().send({ from, to, subject, html });
  }
}

class SMTPDriver {
  constructor(options) {
    this.transporter = nodemailer.createTransport(options);
  }

  async send({ from, to, subject, html }) {
    return this.transporter.sendMail({ from, to, subject, html });
  }
}

class MockEmailDriver {
  async send(email) {
    console.log('[Mock Email] Would send:', email);
    return { id: 'mock-id' };
  }
}

// Main Email Service
export class EmailService {
  constructor() {
    this.driver = this._initDriver();
  }

  _initDriver() {
    switch (config.email.driver) {
      case 'resend':
        return new ResendDriver(config.email.resend);
      case 'mailgun':
        return new MailgunDriver(config.email.mailgun);
      case 'smtp':
        return new SMTPDriver(config.email.smtp);
      case 'mock':
        return new MockEmailDriver();
      default:
        throw new Error(`Unsupported email driver: ${config.email.driver}`);
    }
  }

  async sendConfirmationEmail(to, token) {
    const confirmationUrl = `${config.baseUrl}/auth/confirm?token=${token}`;
    const subject = `Confirm Your ${config.brand.name} Account`;

    const html = this._generateConfirmationTemplate({
      brandName: config.brand.name,
      supportEmail: config.brand.supportEmail,
      confirmationUrl,
      year: new Date().getFullYear(),
    });

    return this.driver.send({
      from: `${config.email.fromName} <${config.email.from}>`,
      to,
      subject,
      html,
      text: `Please confirm your email by visiting: ${confirmationUrl}`,
    });
  }

  _generateConfirmationTemplate({ brandName, supportEmail, confirmationUrl, year }) {
    return `<!DOCTYPE html>
    <html>
    <head> ... </head>
    <body>
      <div>
        <h1>Welcome to ${brandName}</h1>
        <p>Confirm your email: <a href="${confirmationUrl}">${confirmationUrl}</a></p>
        <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        <p>&copy; ${year} ${brandName}</p>
      </div>
    </body>
    </html>`;
  }
}

export const emailService = new EmailService();

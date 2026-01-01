import nodemailer from 'nodemailer';

/**
 * Email configuration and transporter setup
 */

// Create reusable transporter
export const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️  Email credentials not configured. Email functionality will use mock mode.');
    return null;
  }

  // For Gmail or other common services
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });
  }

  // For custom SMTP servers
  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });
  }

  // Fallback to Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

// Export singleton transporter instance
export const emailTransporter = createEmailTransporter();

// Email sender info
export const EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@capitalbridge.com';
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Capital Bridge Nepal';

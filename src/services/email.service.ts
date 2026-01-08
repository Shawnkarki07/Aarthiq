/**
 * Email service for sending notifications
 * Uses nodemailer for sending emails
 */

import { emailTransporter, EMAIL_FROM, EMAIL_FROM_NAME } from '../config/email.config';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email using nodemailer
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // If transporter is not configured, use mock mode
  if (!emailTransporter) {
    console.log('📧 EMAIL SENT (MOCK MODE - No credentials configured)');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('-------------------');
    return;
  }

  try {
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.to);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send onboarding approval email with registration link
 */
export const sendOnboardingApprovalEmail = async (
  email: string,
  businessName: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const registrationUrl = `${frontendUrl}/register?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Business Onboarding Approved - Capital Bridge Nepal',
    html: `
      <h2>Congratulations ${businessName}!</h2>
      <p>Your onboarding request has been approved.</p>
      <p>Please complete your registration by clicking the link below:</p>
      <p><a href="${registrationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Registration</a></p>
      <p>Or copy and paste this URL in your browser:</p>
      <p><code>${registrationUrl}</code></p>
      <p><strong>Note:</strong> This link will expire in 72 hours.</p>
      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `,
    text: `
Congratulations ${businessName}!

Your onboarding request has been approved.

Please complete your registration by clicking the link below:
${registrationUrl}

This link will expire in 72 hours.

What happens next:
1. Click the link above
2. Fill in your business details
3. Create a secure password
4. Submit for final review

Your registration URL contains a unique token that identifies your business.
Do not share this link with anyone else.

Best regards,
Capital Bridge Nepal Team
    `
  });
};

/**
 * Send onboarding rejection email
 */
export const sendOnboardingRejectionEmail = async (
  email: string,
  businessName: string,
  reason: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Business Onboarding Update - Capital Bridge Nepal',
    html: `
      <h2>Dear ${businessName},</h2>
      <p>Thank you for your interest in Capital Bridge Nepal.</p>
      <p>Unfortunately, we cannot approve your onboarding request at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you have questions, please contact our support team.</p>
      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `,
    text: `
Dear ${businessName},

Thank you for your interest in Capital Bridge Nepal.
Unfortunately, we cannot approve your onboarding request at this time.

Reason: ${reason}

If you have questions, please contact our support team.

Best regards,
Capital Bridge Nepal Team
    `
  });
};

/**
 * Send business approval email
 */
export const sendBusinessApprovalEmail = async (
  email: string,
  businessName: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Business Profile Approved - Capital Bridge Nepal',
    html: `
      <h2>Congratulations ${businessName}!</h2>
      <p>Your business profile has been approved and is now live on Capital Bridge Nepal.</p>
      <p>Visit your dashboard to manage your profile and view investor interests.</p>
      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `
  });
};

/**
 * Send business rejection email
 */
export const sendBusinessRejectionEmail = async (
  email: string,
  businessName: string,
  reason: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Business Profile Update - Capital Bridge Nepal',
    html: `
      <h2>Dear ${businessName},</h2>
      <p>Your business profile requires revisions before approval.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please update your profile and resubmit for review.</p>
      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `
  });
};

/**
 * Send interest submission notification to business
 */
export const sendInterestNotificationToBusiness = async (
  businessEmail: string,
  businessName: string,
  investorData: {
    investorName: string;
    phoneNumber: string;
    email: string;
    message?: string;
  }
): Promise<void> => {
  await sendEmail({
    to: businessEmail,
    subject: `New Investment Interest - ${investorData.investorName}`,
    html: `
      <h2>New Investment Interest for ${businessName}</h2>
      <p>You have received a new investment inquiry from an interested investor.</p>

      <h3>Investor Details:</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${investorData.investorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${investorData.email}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${investorData.phoneNumber}</td>
        </tr>
        ${investorData.message ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; vertical-align: top;"><strong>Message:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${investorData.message}</td>
        </tr>
        ` : ''}
      </table>

      <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
      <ol>
        <li>Review the investor's information</li>
        <li>Contact them directly using the details provided</li>
        <li>View all your inquiries in your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/business/dashboard">business dashboard</a></li>
      </ol>

      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `,
    text: `
New Investment Interest for ${businessName}

You have received a new investment inquiry from an interested investor.

Investor Details:
Name: ${investorData.investorName}
Email: ${investorData.email}
Phone: ${investorData.phoneNumber}
${investorData.message ? `Message: ${investorData.message}` : ''}

Next Steps:
1. Review the investor's information
2. Contact them directly using the details provided
3. View all your inquiries in your business dashboard

Best regards,
Capital Bridge Nepal Team
    `
  });
};

/**
 * Send confirmation email to investor after submitting interest
 */
export const sendInterestConfirmationToInvestor = async (
  investorEmail: string,
  investorName: string,
  businessName: string
): Promise<void> => {
  await sendEmail({
    to: investorEmail,
    subject: `Interest Submitted - ${businessName}`,
    html: `
      <h2>Thank you for your interest, ${investorName}!</h2>
      <p>Your investment interest in <strong>${businessName}</strong> has been successfully submitted.</p>

      <p><strong>What happens next?</strong></p>
      <ol>
        <li>The business will receive your contact details</li>
        <li>They will review your inquiry</li>
        <li>You can expect to hear from them within 3-5 business days</li>
      </ol>

      <p>Please keep an eye on your email and phone for communication from ${businessName}.</p>

      <p style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4CAF50;">
        <strong>Note:</strong> Capital Bridge Nepal is a platform that connects businesses with investors.
        We do not participate in or influence investment decisions.
        Please conduct your own due diligence before making any investment commitments.
      </p>

      <p>Best regards,<br>Capital Bridge Nepal Team</p>
    `,
    text: `
Thank you for your interest, ${investorName}!

Your investment interest in ${businessName} has been successfully submitted.

What happens next?
1. The business will receive your contact details
2. They will review your inquiry
3. You can expect to hear from them within 3-5 business days

Please keep an eye on your email and phone for communication from ${businessName}.

Note: Capital Bridge Nepal is a platform that connects businesses with investors.
We do not participate in or influence investment decisions.
Please conduct your own due diligence before making any investment commitments.

Best regards,
Capital Bridge Nepal Team
    `
  });
};

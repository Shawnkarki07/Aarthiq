# Email Setup Guide - Capital Bridge Nepal

## Overview

The platform sends automated emails for:
1. **Onboarding approval** - Registration link to approved businesses
2. **Onboarding rejection** - Notification with reason
3. **Business profile approval** - Confirmation that business is live
4. **Business profile rejection** - Notification with reason for revisions
5. **Interest submission** - Notification to business + confirmation to investor

---

## Email Configuration Options

### Option 1: Gmail (Recommended for Development)

**Steps:**

1. **Create/Use Gmail Account**
   - Use an existing Gmail account or create new one
   - Example: capitalbridge.nepal@gmail.com

2. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (enter "Capital Bridge Nepal")
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

4. **Update .env File**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=capitalbridge.nepal@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   EMAIL_FROM=noreply@capitalbridge.com
   EMAIL_FROM_NAME=Capital Bridge Nepal
   ```

**Note:** Remove spaces from the app password when pasting into .env

---

### Option 2: Custom SMTP Server (Production)

**For services like:**
- SendGrid
- Mailgun
- Amazon SES
- Custom mail server

**Update .env File:**
```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@capitalbridge.com
EMAIL_FROM_NAME=Capital Bridge Nepal
```

**Common SMTP Settings:**

**SendGrid:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<your-sendgrid-api-key>
```

**Mailgun:**
```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASSWORD=<your-mailgun-password>
```

**Amazon SES:**
```
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=<your-ses-smtp-username>
EMAIL_PASSWORD=<your-ses-smtp-password>
```

---

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_SERVICE` | Email service provider | `gmail` or `custom` | Yes |
| `EMAIL_USER` | Email account username | `your-email@gmail.com` | Yes |
| `EMAIL_PASSWORD` | Email account password or app password | `abcdefghijklmnop` | Yes |
| `EMAIL_FROM` | Sender email address | `noreply@capitalbridge.com` | No (defaults to EMAIL_USER) |
| `EMAIL_FROM_NAME` | Sender display name | `Capital Bridge Nepal` | No (defaults to "Capital Bridge Nepal") |
| `EMAIL_HOST` | SMTP host (for custom SMTP) | `smtp.example.com` | No (only for custom SMTP) |
| `EMAIL_PORT` | SMTP port (for custom SMTP) | `587` | No (defaults to 587) |
| `FRONTEND_URL` | Frontend URL for email links | `http://localhost:3000` | Yes |

---

## Testing Email Configuration

### 1. **Mock Mode (No Credentials)**

If email credentials are not configured, the system will log emails to console instead of sending them:

```
📧 EMAIL SENT (MOCK MODE - No credentials configured)
To: test@example.com
Subject: Test Email
-------------------
```

This is useful for development without setting up email.

---

### 2. **Test with Real Emails**

**Test Onboarding Approval Email:**
1. Submit onboarding request via API
2. Admin approves request
3. Check email inbox for registration link

**Test Interest Submission Emails:**
1. Submit interest form via API
2. Check investor email for confirmation
3. Check business email for notification

**Test Business Approval Email:**
1. Complete business registration
2. Admin approves business profile
3. Check business email for approval notification

---

## Email Templates

### Onboarding Approval Email
**To:** Business email
**Subject:** Business Onboarding Approved - Capital Bridge Nepal
**Contains:** Registration link with token (expires in 72 hours)

### Onboarding Rejection Email
**To:** Business email
**Subject:** Business Onboarding Update - Capital Bridge Nepal
**Contains:** Rejection reason

### Business Approval Email
**To:** Business email
**Subject:** Business Profile Approved - Capital Bridge Nepal
**Contains:** Confirmation that profile is live

### Business Rejection Email
**To:** Business email
**Subject:** Business Profile Update - Capital Bridge Nepal
**Contains:** Rejection reason and instructions to revise

### Interest Notification (to Business)
**To:** Business email
**Subject:** New Investment Interest - [Investor Name]
**Contains:** Investor contact details and message

### Interest Confirmation (to Investor)
**To:** Investor email
**Subject:** Interest Submitted - [Business Name]
**Contains:** Confirmation and next steps

---

## Troubleshooting

### Problem: "Error sending email: Invalid login"

**Solution:**
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on Gmail account

---

### Problem: Emails not being sent (no error)

**Solution:**
- Check console for mock mode message
- Verify EMAIL_USER and EMAIL_PASSWORD are set in .env
- Restart server after updating .env

---

### Problem: "Error: self signed certificate in certificate chain"

**Solution:**
- Check EMAIL_PORT (should be 587 for TLS, 465 for SSL)
- For development, you can add to email.config.ts:
  ```typescript
  tls: {
    rejectUnauthorized: false  // Only for development!
  }
  ```

---

### Problem: Gmail blocks login

**Solution:**
- Ensure 2FA is enabled
- Use App Password instead of regular password
- Check "Less secure app access" is OFF (use App Password instead)
- Wait 10 minutes after generating App Password

---

## Security Best Practices

1. **Never commit .env file to git**
   - Already included in .gitignore
   - Use .env.example as template

2. **Use App Passwords for Gmail**
   - Never use your main Gmail password
   - Generate dedicated App Password

3. **Restrict SMTP Credentials**
   - Use dedicated email account for platform
   - Limit SMTP user permissions

4. **For Production:**
   - Use professional email service (SendGrid, Mailgun, SES)
   - Set up SPF, DKIM, DMARC records for your domain
   - Monitor email delivery rates and bounces

---

## Email Service Recommendations

### Development/Testing
- **Gmail** - Free, easy setup with App Password
- Good for: Local development, testing

### Production (Small Scale)
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- Good for: MVP, early stage

### Production (Large Scale)
- **Amazon SES** - $0.10 per 1,000 emails
- **Postmark** - Excellent deliverability
- Good for: High volume, critical emails

---

## Rate Limits

### Gmail (App Password)
- Sending limit: 500 emails/day
- Recipients per email: 500
- Good for development and small deployments

### SendGrid Free Tier
- 100 emails/day forever free
- Can upgrade for higher volume

### Mailgun Free Tier
- 5,000 emails/month for first 3 months
- Then pay-as-you-go

---

## Testing Checklist

- [ ] Email credentials configured in .env
- [ ] Server restarted after .env update
- [ ] Test onboarding approval email
- [ ] Test business approval email
- [ ] Test interest submission emails (both business and investor)
- [ ] Verify email formatting (HTML renders correctly)
- [ ] Check links work in emails
- [ ] Test on different email clients (Gmail, Outlook, etc.)

---

## Email Logs

All email operations are logged to console:

**Successful send:**
```
✅ Email sent successfully to: test@example.com
Message ID: <unique-message-id>
```

**Failed send:**
```
❌ Error sending email: <error details>
```

**Mock mode:**
```
📧 EMAIL SENT (MOCK MODE - No credentials configured)
To: test@example.com
Subject: Test Email
```

---

## Quick Setup Commands

1. **Copy example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file and add email credentials:**
   ```bash
   notepad .env  # Windows
   nano .env     # Linux/Mac
   ```

3. **Restart development server:**
   ```bash
   npm run dev
   ```

4. **Test by triggering an email workflow:**
   - Submit onboarding request
   - Admin approves
   - Check email inbox

---

## Support

If you encounter issues not covered here:
1. Check console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a different email service (Gmail vs SMTP)
4. Check email service status page (e.g., status.sendgrid.com)

---

## Email Customization

To customize email templates, edit:
```
src/services/email.service.ts
```

Each email function contains HTML and text versions:
- `html`: Rich HTML email (what most users see)
- `text`: Plain text fallback (for text-only clients)

Example:
```typescript
await sendEmail({
  to: email,
  subject: 'Your Custom Subject',
  html: `<h1>Custom HTML Content</h1>`,
  text: `Custom plain text content`
});
```

# Email Service Integration Guide

## 🎯 Overview

Your Bookish Bliss application now supports **3 email services**:

1. **SendGrid** - Production-ready email API (recommended)
2. **Gmail SMTP** - Gmail with App Password (requires backend)
3. **Simulation** - Local testing without real emails (current default)

---

## 📧 Email Service Options

### Option 1: SendGrid (Recommended for Production)

**Pros**:
- ✅ Works directly from frontend
- ✅ No backend required
- ✅ Reliable delivery
- ✅ Free tier: 100 emails/day
- ✅ Email analytics
- ✅ Professional sender reputation

**Cons**:
- ❌ Requires API key
- ❌ API key exposed in frontend (use backend for production)

**Best For**: Production applications with backend API

---

### Option 2: Gmail SMTP

**Pros**:
- ✅ Free with Gmail account
- ✅ Familiar interface
- ✅ Good deliverability

**Cons**:
- ❌ Requires backend API (SMTP not possible from browser)
- ❌ Daily sending limits (500 emails/day)
- ❌ Requires App Password setup
- ❌ Currently simulated (needs backend implementation)

**Best For**: Small-scale applications with backend

---

### Option 3: Simulation (Current Default)

**Pros**:
- ✅ No configuration needed
- ✅ Works immediately
- ✅ Perfect for development/testing
- ✅ Full logging and monitoring
- ✅ No API costs

**Cons**:
- ❌ No real emails sent
- ❌ Only logs to console

**Best For**: Development and testing

---

## 🚀 Quick Setup

### Step 1: Choose Your Email Service

Edit `.env.local` and set:

```bash
VITE_EMAIL_SERVICE=simulation    # or 'sendgrid' or 'gmail'
```

### Step 2: Configure API Keys (if using SendGrid or Gmail)

See detailed instructions below for each service.

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 📝 SendGrid Setup (Detailed)

### 1. Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Sign up for free account
3. Verify your email address

### 2. Get API Key

1. Log in to SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: "Bookish Bliss Development"
5. Permissions: **Full Access** (or **Mail Send** only)
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### 3. Configure Environment Variables

Edit `.env.local`:

```bash
# Set service to SendGrid
VITE_EMAIL_SERVICE=sendgrid

# Add your SendGrid API key
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configure sender email (must be verified in SendGrid)
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_SENDGRID_FROM_NAME=Bookish Bliss

# Enable email service
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

### 4. Verify Sender Email (Important!)

**For Free Tier**:
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details
4. Verify the email address
5. Use this verified email as `VITE_SENDGRID_FROM_EMAIL`

**For Production** (recommended):
1. Authenticate your domain
2. Set up DNS records
3. Use any email from your domain

### 5. Test SendGrid Integration

```bash
# Restart dev server
npm run dev

# Open browser console (F12)
# Place an order and approve it in admin panel
# Check console for:
[EMAIL CONFIG] Service Configuration
  Service: sendgrid
  SendGrid API Key: ✓ Set

[EMAIL SUCCESS] msg-abc123xyz
  Protocol: SendGrid
  Status: Delivered
```

---

## 📝 Gmail SMTP Setup (Detailed)

### 1. Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow setup instructions

### 2. Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: "Bookish Bliss"
5. Click **Generate**
6. **Copy the 16-character password** (no spaces)

### 3. Configure Environment Variables

Edit `.env.local`:

```bash
# Set service to Gmail
VITE_EMAIL_SERVICE=gmail

# Add your Gmail credentials
VITE_GMAIL_USER=your.email@gmail.com
VITE_GMAIL_APP_PASSWORD=abcdefghijklmnop

# Configure sender name
VITE_GMAIL_FROM_NAME=Bookish Bliss

# Enable email service
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

### 4. Important Note: Backend Required

⚠️ **Gmail SMTP cannot be used directly from the browser** due to CORS and security restrictions.

**Current Status**: Gmail mode is **simulated** with enhanced logging.

**To use real Gmail SMTP**, you need to:
1. Create a backend API endpoint (Node.js/Express)
2. Use `nodemailer` package
3. Call backend API from frontend

**Example Backend Code** (for reference):

```javascript
// backend/routes/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body } = req.body;
  
  try {
    await transporter.sendMail({
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: body
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 📝 Simulation Mode Setup (Default)

### No Setup Required!

Simulation mode works out of the box.

Edit `.env.local`:

```bash
# Set service to simulation (default)
VITE_EMAIL_SERVICE=simulation

# Enable email service
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

### Features

- ✅ Full SMTP protocol simulation
- ✅ Console logging with API keys
- ✅ localStorage persistence
- ✅ Admin Dashboard Intelligence Ledger
- ✅ All email features work
- ✅ Perfect for development

---

## 🔧 Environment Variables Reference

### Required for All Services

```bash
VITE_EMAIL_SERVICE=simulation|sendgrid|gmail
VITE_EMAIL_ENABLED=true|false
VITE_EMAIL_DEBUG=true|false
```

### SendGrid Specific

```bash
VITE_SENDGRID_API_KEY=SG.xxxx...
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_SENDGRID_FROM_NAME=Bookish Bliss
```

### Gmail Specific

```bash
VITE_GMAIL_USER=your.email@gmail.com
VITE_GMAIL_APP_PASSWORD=abcdefghijklmnop
VITE_GMAIL_FROM_NAME=Bookish Bliss
```

---

## 🧪 Testing Email Services

### Test in Browser Console

```javascript
// Check email configuration
import { getEmailConfig } from '@/utils/emailService';
console.log(getEmailConfig());

// Expected output:
{
  service: "sendgrid",
  enabled: true,
  debug: true,
  sendgridConfigured: true,
  gmailConfigured: false
}
```

### Test Email Sending

1. Open http://localhost:8080
2. Place an order
3. Go to Admin Panel → Orders
4. Approve the order
5. Check browser console for logs

**SendGrid Success**:
```
[EMAIL CONFIG] Service Configuration
  Service: sendgrid
  SendGrid API Key: ✓ Set

[SENDGRID] Sending email via SendGrid API
[EMAIL SUCCESS] msg-abc123xyz
  Protocol: SendGrid
  Status: Delivered
  Delivery Time: 1234ms
```

**Gmail Success** (simulated):
```
[EMAIL CONFIG] Service Configuration
  Service: gmail
  Gmail User: your.email@gmail.com
  Gmail App Password: ✓ Set

[GMAIL SMTP OUTGOING] msg-abc123xyz
  SMTP SERVER: smtp.gmail.com:587
  AUTH: your.email@gmail.com
  Status: Delivered (Simulated)
  Note: Gmail SMTP requires backend API
```

**Simulation Success**:
```
[EMAIL CONFIG] Service Configuration
  Service: simulation

[SMTP OUTGOING] msg-abc123xyz
  AUTH: API-KEY aB3dEf9H-xY2zW4vU...
  HELO bookstore.smtp.relay
  Status: Delivered
```

---

## ⚠️ Security Best Practices

### 1. Never Commit API Keys

✅ `.env.local` is gitignored  
✅ `.env.example` has placeholder values  
❌ Never commit real API keys to Git

### 2. Use Backend for Production

For production applications:
- ✅ Store API keys on backend server
- ✅ Create API endpoint for sending emails
- ✅ Call backend from frontend
- ❌ Don't expose API keys in frontend code

### 3. Rotate API Keys Regularly

- Change SendGrid API keys every 90 days
- Revoke old keys immediately
- Use different keys for dev/staging/production

---

## 🔍 Troubleshooting

### SendGrid: "Unauthorized" Error

**Problem**: API key not working

**Solutions**:
1. Check API key is correct (no extra spaces)
2. Verify API key has "Mail Send" permission
3. Check API key hasn't been revoked
4. Try creating a new API key

### SendGrid: "Sender Email Not Verified"

**Problem**: Sender email not verified

**Solutions**:
1. Go to SendGrid → Settings → Sender Authentication
2. Verify your sender email
3. Use the verified email in `VITE_SENDGRID_FROM_EMAIL`

### Gmail: "Invalid Credentials"

**Problem**: App password not working

**Solutions**:
1. Check 2-Step Verification is enabled
2. Generate new App Password
3. Copy password without spaces
4. Use exact Gmail address

### Emails Not Sending

**Problem**: No emails being sent

**Solutions**:
1. Check `VITE_EMAIL_ENABLED=true`
2. Check `VITE_EMAIL_SERVICE` is set correctly
3. Restart dev server after changing `.env.local`
4. Check browser console for errors
5. Verify API keys are configured

---

## 📊 Monitoring Email Delivery

### Browser Console

```javascript
// Get email statistics
import { getEmailStats } from '@/utils/emailService';
console.log(getEmailStats());

// Output:
{
  total: 47,
  delivered: 45,
  failed: 2,
  successRate: "95.74%",
  lastEmail: {...},
  service: "sendgrid"
}
```

### Admin Dashboard

- Go to Admin Panel → Intelligence Ledger
- View all sent emails
- See delivery status
- Check API keys used

### localStorage

```javascript
// View all email logs
JSON.parse(localStorage.getItem('admin_email_logs'))

// View failed emails only
import { getFailedEmails } from '@/utils/emailService';
console.log(getFailedEmails());
```

---

## 📁 Files Reference

### Configuration Files

- `.env.example` - Template with all variables
- `.env.local` - Your local configuration (gitignored)

### Email Service Files

- `src/utils/emailService.ts` - Main email service (NEW)
- `src/utils/email.ts` - Original email utility (deprecated, use emailService.ts)
- `src/utils/emailScheduler.ts` - Periodic email scheduler

### Usage in Code

```typescript
// Import from new email service
import { sendEmail, getEmailConfig, getEmailStats } from '@/utils/emailService';

// Send email
await sendEmail(
  'user@example.com',
  'Order Confirmed',
  'Your order has been confirmed!',
  false // silent mode
);

// Check configuration
const config = getEmailConfig();
console.log('Using service:', config.service);

// Get statistics
const stats = getEmailStats();
console.log('Success rate:', stats.successRate);
```

---

## 🎯 Recommended Setup

### For Development

```bash
VITE_EMAIL_SERVICE=simulation
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

**Why**: No setup, instant testing, full logging

### For Staging/Testing

```bash
VITE_EMAIL_SERVICE=sendgrid
VITE_SENDGRID_API_KEY=SG.test_key...
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

**Why**: Test real email delivery without affecting production

### For Production

**Backend API** (recommended):
```bash
# Frontend .env
VITE_EMAIL_SERVICE=backend
VITE_EMAIL_API_URL=https://api.yourdomain.com/send-email

# Backend .env
SENDGRID_API_KEY=SG.prod_key...
```

**Why**: Secure, scalable, API keys protected

---

## ✅ Quick Start Checklist

### Using SendGrid

- [ ] Create SendGrid account
- [ ] Get API key
- [ ] Verify sender email
- [ ] Add API key to `.env.local`
- [ ] Set `VITE_EMAIL_SERVICE=sendgrid`
- [ ] Restart dev server
- [ ] Test email sending
- [ ] Check console for success logs

### Using Gmail

- [ ] Enable 2-Step Verification
- [ ] Create App Password
- [ ] Add credentials to `.env.local`
- [ ] Set `VITE_EMAIL_SERVICE=gmail`
- [ ] Restart dev server
- [ ] Note: Currently simulated (needs backend)

### Using Simulation

- [ ] Set `VITE_EMAIL_SERVICE=simulation` (default)
- [ ] Restart dev server
- [ ] Test email sending
- [ ] Check console logs

---

## 🆘 Need Help?

### SendGrid Documentation
- https://docs.sendgrid.com/

### Gmail App Passwords
- https://support.google.com/accounts/answer/185833

### Nodemailer (for Gmail backend)
- https://nodemailer.com/

---

**Last Updated**: February 5, 2026  
**Status**: ✅ Ready to Use  
**Developer**: Antigravity AI Assistant

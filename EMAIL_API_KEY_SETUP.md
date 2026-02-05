# Email API Key Setup - Quick Reference

## 🚀 Quick Setup (Choose One)

### Option 1: SendGrid (Recommended)

```bash
# 1. Get API key from: https://app.sendgrid.com/settings/api_keys

# 2. Edit .env.local:
VITE_EMAIL_SERVICE=sendgrid
VITE_SENDGRID_API_KEY=SG.your_api_key_here
VITE_SENDGRID_FROM_EMAIL=noreply@yourdomain.com
VITE_EMAIL_ENABLED=true

# 3. Restart server:
npm run dev
```

---

### Option 2: Gmail SMTP

```bash
# 1. Get App Password from: https://myaccount.google.com/apppasswords

# 2. Edit .env.local:
VITE_EMAIL_SERVICE=gmail
VITE_GMAIL_USER=your.email@gmail.com
VITE_GMAIL_APP_PASSWORD=your_16_char_password
VITE_EMAIL_ENABLED=true

# 3. Restart server:
npm run dev

# Note: Gmail SMTP is currently simulated (requires backend for real sending)
```

---

### Option 3: Simulation (No Setup)

```bash
# Already configured! Just use it:
VITE_EMAIL_SERVICE=simulation
VITE_EMAIL_ENABLED=true

# Restart server:
npm run dev
```

---

## 📧 SendGrid API Key - Step by Step

### 1. Create Account
- Go to: https://signup.sendgrid.com/
- Sign up (free tier: 100 emails/day)

### 2. Get API Key
1. Login → Settings → API Keys
2. Click "Create API Key"
3. Name: "Bookish Bliss Dev"
4. Permissions: "Full Access"
5. Click "Create & View"
6. **COPY THE KEY** (you won't see it again!)

### 3. Verify Sender Email
1. Settings → Sender Authentication
2. "Verify a Single Sender"
3. Enter your email
4. Verify via email link

### 4. Configure
```bash
# Edit .env.local
VITE_EMAIL_SERVICE=sendgrid
VITE_SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_SENDGRID_FROM_EMAIL=your_verified_email@example.com
VITE_SENDGRID_FROM_NAME=Bookish Bliss
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

### 5. Test
```bash
# Restart server
npm run dev

# Open browser console (F12)
# Place order → Approve in admin
# Check console for:
[EMAIL SUCCESS] msg-abc123xyz
  Protocol: SendGrid
  Status: Delivered
```

---

## 📧 Gmail App Password - Step by Step

### 1. Enable 2-Step Verification
- Go to: https://myaccount.google.com/security
- Click "2-Step Verification"
- Follow setup

### 2. Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Enter: "Bookish Bliss"
5. Click "Generate"
6. **COPY THE 16-CHARACTER PASSWORD**

### 3. Configure
```bash
# Edit .env.local
VITE_EMAIL_SERVICE=gmail
VITE_GMAIL_USER=your.email@gmail.com
VITE_GMAIL_APP_PASSWORD=abcdefghijklmnop
VITE_GMAIL_FROM_NAME=Bookish Bliss
VITE_EMAIL_ENABLED=true
VITE_EMAIL_DEBUG=true
```

### 4. Important Note
⚠️ Gmail SMTP is **currently simulated** (browser limitation)

To use real Gmail SMTP, you need a backend API.

---

## 🔍 Verify Configuration

### Check in Browser Console

```javascript
// After restarting server, check console for:
[EMAIL CONFIG] Service Configuration
  Service: sendgrid (or gmail or simulation)
  SendGrid API Key: ✓ Set (or ✗ Not Set)
  Gmail User: your.email@gmail.com (or ✗ Not Set)
```

### Test Email Sending

1. Place an order
2. Go to Admin Panel → Orders
3. Approve the order
4. Check console for email logs

---

## ⚠️ Common Issues

### SendGrid: "Unauthorized"
- ✅ Check API key is correct
- ✅ Verify API key has "Mail Send" permission
- ✅ Try creating new API key

### SendGrid: "Sender Not Verified"
- ✅ Verify sender email in SendGrid dashboard
- ✅ Use verified email in VITE_SENDGRID_FROM_EMAIL

### Gmail: "Invalid Credentials"
- ✅ Check 2-Step Verification is enabled
- ✅ Generate new App Password
- ✅ Copy password without spaces

### Emails Not Sending
- ✅ Check VITE_EMAIL_ENABLED=true
- ✅ Restart dev server after changing .env.local
- ✅ Check browser console for errors

---

## 📁 Files

- `.env.example` - Template (don't edit)
- `.env.local` - Your config (edit this)
- `src/utils/emailService.ts` - Email service
- `EMAIL_SERVICE_SETUP_GUIDE.md` - Full guide

---

## 🎯 Recommended for You

**Development**: Use `simulation` (no setup needed)  
**Testing**: Use `sendgrid` (free tier)  
**Production**: Use `sendgrid` with backend API

---

## 📞 Quick Links

- SendGrid Signup: https://signup.sendgrid.com/
- SendGrid API Keys: https://app.sendgrid.com/settings/api_keys
- Gmail App Passwords: https://myaccount.google.com/apppasswords
- Full Setup Guide: `EMAIL_SERVICE_SETUP_GUIDE.md`

---

**Current Status**: ✅ Email system ready with 3 service options!

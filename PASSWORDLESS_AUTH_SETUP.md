# 🔐 Passwordless Authentication Setup Guide

This guide covers how to set up and configure passwordless email authentication (Magic Link and OTP) in your Supabase project, following the official Supabase documentation.

## 🚀 Overview

Your application now supports three authentication methods:
1. **Traditional Password** - Email + Password login
2. **Magic Link** - Click a link in email to sign in
3. **OTP (One-Time Password)** - Enter a 6-digit code from email

## 📧 Email Template Configuration

### 1. Access Email Templates

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication** → **Email Templates**
3. **You'll see templates for different authentication flows**

### 2. Configure Magic Link Template

The Magic Link template is used by default when calling `signInWithOtp()`. It should contain:

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

**For PKCE flow** (recommended for production), use this template instead:

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log In</a></p>
```

### 3. Configure OTP Template

To enable OTP authentication, modify the Magic Link template to include the `{{ .Token }}` variable:

```html
<h2>One time login code</h2>
<p>Please enter this code: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 1 hour.</p>
```

## 🔧 Implementation Details

### Magic Link Flow

1. **User enters email** → `signInWithMagicLink(email)`
2. **Email sent** → User receives Magic Link
3. **User clicks link** → Redirects to `/auth/callback`
4. **Automatic sign in** → User is authenticated

### OTP Flow

1. **User enters email** → `signInWithOtp(email)`
2. **Email sent** → User receives 6-digit code
3. **User enters code** → `verifyOtp(email, code, 'email')`
4. **Verification** → User is authenticated

## 📱 Available Pages

### New Authentication Pages

- **`/auth/magic-link`** - Magic Link authentication
- **`/auth/otp`** - OTP authentication
- **`/auth/login`** - Updated with passwordless options

### Updated Components

- **`src/lib/supabase-client.ts`** - Added passwordless auth methods
- **`src/contexts/AuthContext.tsx`** - Added passwordless auth context
- **`src/app/auth/login/page.tsx`** - Added passwordless options

## 🔑 API Methods

### Magic Link Authentication

```typescript
// Send Magic Link
const { data, error } = await auth.signInWithMagicLink(email, {
  shouldCreateUser: true, // Create account if doesn't exist
  emailRedirectTo: 'https://your-domain.com/auth/callback'
});
```

### OTP Authentication

```typescript
// Step 1: Send OTP
const { data, error } = await auth.signInWithOtp(email, {
  shouldCreateUser: true // Create account if doesn't exist
});

// Step 2: Verify OTP
const { data, error } = await auth.verifyOtp(email, '123456', 'email');
```

## ⚙️ Configuration Options

### shouldCreateUser Option

- **`true`** (default) - Automatically create account if email doesn't exist
- **`false`** - Only allow existing users to sign in

### Email Redirect URLs

Configure these in your Supabase Dashboard:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: 
  - `https://your-domain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (development)

## 🧪 Testing

### Development Testing

1. **Start your development server**: `npm run dev`
2. **Navigate to**: `http://localhost:3000/auth/login`
3. **Choose authentication method**:
   - Click "Sign in with Magic Link"
   - Click "Sign in with OTP"
4. **Test with real email address**
5. **Check email for link/code**
6. **Verify authentication flow**

### Production Testing

1. **Deploy your application**
2. **Update Supabase settings** with production domain
3. **Test all three authentication methods**
4. **Verify email delivery** to different providers
5. **Test on mobile devices**

## 🔒 Security Considerations

### Rate Limiting

- **Magic Link**: 1 request per 60 seconds per email
- **OTP**: 1 request per 60 seconds per email
- **Expiration**: Both expire after 1 hour

### Best Practices

1. **Use HTTPS** in production
2. **Configure proper redirect URLs**
3. **Monitor authentication logs**
4. **Implement proper error handling**
5. **Test email delivery reliability**

## 🚨 Troubleshooting

### Email Not Sending

1. **Check Supabase project settings**
2. **Verify email provider configuration**
3. **Check environment variables**
4. **Review Supabase logs**

### Magic Link Not Working

1. **Verify redirect URLs** in Supabase settings
2. **Check email template** configuration
3. **Ensure HTTPS** in production
4. **Test with different email providers**

### OTP Not Working

1. **Verify email template** includes `{{ .Token }}`
2. **Check OTP expiration** settings
3. **Ensure proper verification** flow
4. **Test code entry** functionality

### Common Issues

1. **"Invalid redirect URL"** - Check Supabase redirect settings
2. **"Email not found"** - Set `shouldCreateUser: true`
3. **"OTP expired"** - Request new code
4. **"Rate limit exceeded"** - Wait 60 seconds

## 📊 Monitoring

### Supabase Dashboard

- **Authentication** → **Users** - View user accounts
- **Authentication** → **Logs** - Monitor auth events
- **Analytics** → **Auth** - Track authentication metrics

### Key Metrics

- **Sign-up rate** by authentication method
- **Email delivery success** rate
- **Authentication completion** rate
- **Error rates** by method

## 🔗 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Magic Link Guide](https://supabase.com/docs/guides/auth/auth-magic-link)
- [OTP Guide](https://supabase.com/docs/guides/auth/auth-otp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## 🎯 Next Steps

1. **Configure email templates** in Supabase Dashboard
2. **Test all authentication flows**
3. **Customize email templates** for your brand
4. **Monitor authentication metrics**
5. **Implement additional security measures** if needed

---

**Remember**: Passwordless authentication improves user experience and security. Make sure to test thoroughly in both development and production environments! 🚀 
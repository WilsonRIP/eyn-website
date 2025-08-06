# 🏠 Self-Hosted Supabase Configuration Guide

This guide explains how your application has been configured to work with your self-hosted Supabase instance.

## 🔧 Configuration Overview

Your application is now configured to work with your self-hosted Supabase instance running at:
- **URL**: `http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me`
- **Environment**: Your `.env.local` file contains all the necessary configuration

## 📋 Environment Variables

### Updated Code Configuration

The code has been updated to use your environment variables:

```typescript
// Supabase URL and Keys
const supabaseUrl = process.env.SUPABASE_PUBLIC_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me'
const supabaseAnonKey = process.env.ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTQ0NDQ0NzcsImV4cCI6MTg5MzQ1NjAwMCwiaXNzIjoiZG9rcGxveSJ9.-PVTs6MA84dSs7bFIp7DVZi9fJReX_XwV_Xh7J_pcT8'
```

### Your Environment Variables

From your `.env.local` file:

```env
# Supabase Configuration
SUPABASE_HOST=eyn-website-supabase-229e2b-147-79-78-227.traefik.me
SUPABASE_PUBLIC_URL=http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTQ0NDQ0NzcsImV4cCI6MTg5MzQ1NjAwMCwiaXNzIjoiZG9rcGxveSJ9.-PVTs6MA84dSs7bFIp7DVZi9fJReX_XwV_Xh7J_pcT8
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTQ0NDQ0NzcsImV4cCI6MTg5MzQ1NjAwMCwiaXNzIjoiZG9rcGxveSJ9.-PVTs6MA84dSs7bFIp7DVZi9fJReX_XwV_Xh7J_pcT8

# Email Configuration
GOTRUE_MAILER_EXTERNAL_HOSTS=eyn-website-supabase-229e2b-147-79-78-227.traefik.me

# Auth Settings
SITE_URL=http://localhost:3000
ADDITIONAL_REDIRECT_URLS=http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me/*,http://localhost:3000/*
API_EXTERNAL_URL=http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me
```

## 🔄 Updated Files

The following files have been updated to work with your configuration:

### 1. `src/lib/supabase-client.ts`
- Updated to use `SUPABASE_PUBLIC_URL` and `ANON_KEY`
- Fallback to default values if environment variables are not set

### 2. `src/lib/utils/supabase/client.ts`
- Updated browser client configuration
- Uses your environment variables

### 3. `src/lib/utils/supabase/server.ts`
- Updated server-side client configuration
- Handles async cookies properly

### 4. `src/lib/utils/supabase/middleware.ts`
- Updated middleware configuration
- Uses your environment variables

## 📧 Email Configuration

Your email confirmation is configured to use:
- **External Host**: `eyn-website-supabase-229e2b-147-79-78-227.traefik.me`
- **SMTP**: Using fake mail setup for development
- **Redirect URLs**: Configured for both localhost and your domain

## 🚀 How It Works

### 1. **Client-Side Requests**
- Your Next.js app connects to your self-hosted Supabase instance
- Uses the `SUPABASE_PUBLIC_URL` and `ANON_KEY` from your environment

### 2. **Server-Side Requests**
- Server-side code also connects to your self-hosted instance
- Uses the same configuration for consistency

### 3. **Email Confirmation**
- Email links use your external hostname
- Redirects work for both development and production

### 4. **OAuth and Magic Links**
- All authentication flows work with your self-hosted setup
- Redirect URLs are properly configured

## 🧪 Testing Your Setup

### 1. **Start Your Development Server**
```bash
npm run dev
```

### 2. **Test Authentication**
- Navigate to `http://localhost:3000/auth/login`
- Try signing up with email/password
- Test Magic Link authentication
- Test OTP authentication

### 3. **Check Email Confirmation**
- Sign up with a real email address
- Check your email for confirmation links
- Verify links use your external hostname

### 4. **Access Supabase Dashboard**
- Your Supabase Studio should be accessible at:
  `http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me`
- Username: `supabase`
- Password: `bd28npwzzlc3wyccugxcponwb5opkeul`

## 🔒 Security Notes

### Development Environment
- Using fake SMTP for email testing
- All secrets are generated automatically
- Suitable for development and testing

### Production Considerations
- Change all secrets before going to production
- Configure real SMTP provider
- Use HTTPS in production
- Secure your environment variables

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that `ANON_KEY` is correctly set
   - Verify the key matches your Supabase instance

2. **Email not sending**
   - Check SMTP configuration in Supabase
   - Verify `GOTRUE_MAILER_EXTERNAL_HOSTS` is set

3. **Redirect errors**
   - Check `ADDITIONAL_REDIRECT_URLS` configuration
   - Verify `SITE_URL` is correct

4. **Connection errors**
   - Ensure your Supabase instance is running
   - Check network connectivity to your domain

### Debug Steps

1. **Check environment variables**:
   ```bash
   echo $SUPABASE_PUBLIC_URL
   echo $ANON_KEY
   ```

2. **Test Supabase connection**:
   ```bash
   curl http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me/rest/v1/
   ```

3. **Check Supabase logs**:
   - Access your Supabase dashboard
   - Check Authentication → Logs

## 📊 Monitoring

### Supabase Dashboard
- **URL**: `http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me`
- **Authentication** → **Users** - View user accounts
- **Authentication** → **Logs** - Monitor auth events
- **Analytics** → **Auth** - Track authentication metrics

### Application Logs
- Check your Next.js application logs
- Monitor authentication events
- Track email delivery success

## 🎯 Next Steps

1. **Test all authentication methods**
2. **Configure real SMTP** for production
3. **Set up monitoring** and analytics
4. **Secure your environment** for production
5. **Customize email templates** in Supabase dashboard

---

**Your application is now fully configured to work with your self-hosted Supabase instance!** 🚀 
# 📧 Email Confirmation Guide

This guide covers how to set up and manage email confirmation in your Supabase authentication system.

## 🚀 Quick Setup

### 1. Enable Email Confirmation in Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication** → **Settings**
3. **Under "Email Auth" section:**
   - ✅ **Enable "Enable email confirmations"**
   - ✅ **Enable "Enable secure email change"** (optional)
   - Set **"Confirm email template"** (customize if needed)

### 2. Configure Site URLs

1. **Go to Authentication** → **Settings**
2. **Set Site URL:**
   - **Development:** `http://localhost:3000`
   - **Production:** `https://your-domain.com`
3. **Add Redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 📋 Email Confirmation Flow

### User Journey:
1. **User signs up** → Account created but not confirmed
2. **Confirmation email sent** → User receives email with verification link
3. **User clicks link** → Email confirmed, account activated
4. **User redirected** → To dashboard or login page

### Code Flow:
```typescript
// 1. User signs up
const { data, error } = await signUp(email, password);

// 2. Redirect to verification page
router.push("/auth/verify-email");

// 3. User clicks email link → redirects to /auth/callback
// 4. Callback page handles the confirmation
```

## 🎨 Customize Email Templates

### 1. Go to Authentication → Email Templates
### 2. Click on "Confirm signup"
### 3. Customize the template:

```html
<!-- Example custom template -->
<h2>Welcome to EYN Website! 🎉</h2>
<p>Hi there!</p>
<p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>

<a href="{{ .ConfirmationURL }}" 
   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
  ✅ Confirm Email Address
</a>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #6b7280;">{{ .ConfirmationURL }}</p>

<p>If you didn't create an account, you can safely ignore this email.</p>

<p>Best regards,<br>The EYN Team</p>
```

## 🔧 Available Functions

### Resend Confirmation Email
```typescript
const { resendConfirmationEmail } = useAuth();

const handleResend = async (email: string) => {
  const { data, error } = await resendConfirmationEmail(email);
  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Confirmation email sent!");
  }
};
```

### Check Email Confirmation Status
```typescript
const { user } = useAuth();

// Check if user's email is confirmed
const isEmailConfirmed = user?.email_confirmed_at !== null;
```

## 🧪 Testing Email Confirmation

### Development Testing:
1. **Use a real email address** (not fake ones)
2. **Check spam folder** if email doesn't arrive
3. **Test the confirmation link** by clicking it
4. **Verify redirect** to dashboard after confirmation

### Production Testing:
1. **Test with real email addresses**
2. **Verify email delivery** to different providers (Gmail, Outlook, etc.)
3. **Test confirmation flow** end-to-end
4. **Monitor email delivery rates**

## 🚨 Troubleshooting

### Email Not Sending:
1. **Check Supabase project settings**
   - Verify email is enabled
   - Check email provider configuration
2. **Check environment variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. **Check Supabase logs**
   - Go to Logs → Auth → Look for email errors

### Email Not Arriving:
1. **Check spam/junk folder**
2. **Verify email address is correct**
3. **Wait a few minutes** for delivery
4. **Try resending** the confirmation email

### Confirmation Link Not Working:
1. **Check redirect URLs** in Supabase settings
2. **Verify site URL** is correct
3. **Check if link is expired** (links expire after 24 hours)
4. **Try resending** a new confirmation email

### User Stuck on Verification Page:
1. **Check if email is already confirmed**
2. **Try logging in** directly
3. **Check browser console** for errors
4. **Verify callback page** is working

## 📱 Mobile Email Testing

### iOS Mail App:
- Links work normally
- Check "Junk" folder
- Verify email rendering

### Gmail App:
- Check "Spam" folder
- Verify email formatting
- Test link functionality

### Outlook App:
- Check "Junk Email" folder
- Verify email display
- Test confirmation links

## 🔒 Security Considerations

### Email Confirmation Best Practices:
1. **Always require email confirmation** for new accounts
2. **Set reasonable expiration times** for confirmation links
3. **Use HTTPS** for all confirmation links
4. **Implement rate limiting** for resend requests
5. **Log confirmation attempts** for security monitoring

### Rate Limiting:
```sql
-- Example rate limiting for email resend
CREATE OR REPLACE FUNCTION check_email_resend_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has requested too many resends recently
  -- Implementation depends on your rate limiting strategy
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Monitoring & Analytics

### Track Email Confirmation Metrics:
1. **Confirmation rate** (emails sent vs confirmed)
2. **Time to confirm** (how long users take to confirm)
3. **Resend requests** (how often users request resends)
4. **Bounce rates** (email delivery issues)

### Supabase Analytics:
- Go to **Analytics** → **Auth** → **Email confirmations**
- Monitor confirmation rates
- Track email delivery success

## 🎯 Best Practices

### Email Content:
- ✅ Use clear, friendly language
- ✅ Include your brand/logo
- ✅ Make the confirmation button prominent
- ✅ Provide fallback text link
- ✅ Include support contact info

### User Experience:
- ✅ Show clear success/error messages
- ✅ Provide resend option
- ✅ Give helpful troubleshooting tips
- ✅ Redirect users appropriately after confirmation

### Technical Implementation:
- ✅ Handle all error cases gracefully
- ✅ Provide loading states
- ✅ Implement proper redirects
- ✅ Log important events for debugging

## 🔗 Related Files

- `src/app/auth/verify-email/page.tsx` - Email verification page
- `src/app/auth/callback/page.tsx` - Handles confirmation redirects
- `src/app/auth/signup/page.tsx` - Redirects to verification after signup
- `src/contexts/AuthContext.tsx` - Auth context with confirmation functions
- `src/lib/supabase-client.ts` - Supabase client with auth helpers

## 📞 Support

If you're still having issues:

1. **Check Supabase documentation**: https://supabase.com/docs/guides/auth
2. **Review Supabase logs** in your dashboard
3. **Test with a different email address**
4. **Verify your Supabase project settings**
5. **Check your environment variables**

---

**Remember**: Email confirmation is crucial for account security and user verification. Make sure to test thoroughly in both development and production environments! 🚀 
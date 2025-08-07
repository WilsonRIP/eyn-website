# Better Auth Setup Guide

This guide will help you set up Better Auth with Supabase integration for your Next.js application.

## Prerequisites

- Better Auth is already installed in your project
- Supabase project is set up
- Environment variables are configured

## Step 1: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
SUPABASE_PUBLIC_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ANON_KEY=your_anon_key_here

# Better Auth Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Social Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Configuration (Optional - for email verification, password reset, etc.)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Gemini API (for your existing AI tools)
GEMINI_API_KEY=your_gemini_api_key
```

## Step 2: Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Better Auth will manage this)
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "emailVerified" boolean DEFAULT false,
  "name" text,
  "image" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expiresAt" timestamp with time zone NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "providerAccountId" text NOT NULL,
  "refreshToken" text,
  "accessToken" text,
  "expiresAt" bigint,
  "tokenType" text,
  "scope" text,
  "idToken" text,
  "sessionState" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  UNIQUE("provider", "providerAccountId")
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS "verificationTokens" (
  "identifier" text NOT NULL,
  "token" text PRIMARY KEY,
  "expiresAt" timestamp with time zone NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_idx" ON "accounts"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "verificationTokens_token_idx" ON "verificationTokens"("token");

-- Enable Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verificationTokens" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON "users"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON "users"
  FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for sessions table
CREATE POLICY "Users can view their own sessions" ON "sessions"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own sessions" ON "sessions"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own sessions" ON "sessions"
  FOR DELETE USING (auth.uid()::text = "userId");

-- RLS Policies for accounts table
CREATE POLICY "Users can view their own accounts" ON "accounts"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own accounts" ON "accounts"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own accounts" ON "accounts"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own accounts" ON "accounts"
  FOR DELETE USING (auth.uid()::text = "userId");

-- RLS Policies for verification tokens table
CREATE POLICY "Anyone can view verification tokens" ON "verificationTokens"
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert verification tokens" ON "verificationTokens"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete verification tokens" ON "verificationTokens"
  FOR DELETE USING (true);

-- Create a function to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON "accounts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Social Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/social/google/callback`
6. Copy the Client ID and Client Secret to your environment variables

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set the Authorization callback URL to: `http://localhost:3000/api/auth/social/github/callback`
4. Copy the Client ID and Client Secret to your environment variables

## Step 4: Email Configuration (Optional)

If you want to enable email verification and password reset:

1. Set up an SMTP service (Gmail, SendGrid, etc.)
2. Add the email configuration to your environment variables
3. Update the `email` configuration in `src/lib/auth.ts`

## Step 5: Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/auth/signup` to test user registration
3. Navigate to `/auth/login` to test user login
4. Test social login with Google/GitHub

## Step 6: Usage Examples

### Client-side Authentication

```tsx
import { useBetterAuth } from '@/src/contexts/BetterAuthContext';

function MyComponent() {
  const { user, signIn, signUp, signOut } = useBetterAuth();

  const handleSignIn = async () => {
    const { data, error } = await signIn('user@example.com', 'password');
    if (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async () => {
    const { data, error } = await signUp('user@example.com', 'password', 'John Doe');
    if (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

### Server-side Authentication

```tsx
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

## Step 7: Migration from Existing Auth

If you're migrating from an existing authentication system:

1. Export your existing user data
2. Transform the data to match Better Auth's schema
3. Import the data into the new tables
4. Update any existing components to use the new auth context

## Troubleshooting

### Common Issues

1. **"SUPABASE_SERVICE_ROLE_KEY is required"**: Make sure you've set the service role key in your environment variables
2. **"Invalid redirect URI"**: Check that your OAuth redirect URIs match exactly
3. **"Database connection failed"**: Verify your Supabase URL and keys are correct
4. **"RLS policy violation"**: Ensure the RLS policies are correctly set up

### Debug Mode

Enable debug mode by adding this to your environment variables:

```env
DEBUG=better-auth:*
```

## Next Steps

1. Create authentication pages (login, signup, forgot password)
2. Add protected routes
3. Implement user profile management
4. Add account linking functionality
5. Set up email templates for verification and password reset

## Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

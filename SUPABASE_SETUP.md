# Supabase Authentication & Database Setup

This guide will help you set up Supabase authentication and database integration for your EYN website.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter a project name (e.g., "eyn-website")
6. Enter a database password
7. Choose a region close to your users
8. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials.

## 4. Database Integration Setup

The application now includes SSR-compatible Supabase clients for different contexts:

### Available Clients

1. **Browser Client** (`createBrowserSupabaseClient`): For client-side operations
2. **Server Client** (`createServerSupabaseClient`): For server-side operations in Server Components
3. **Middleware Client** (`createMiddlewareSupabaseClient`): For middleware operations

### Usage Examples

#### Server-Side Database Operations
```typescript
import { createServerSupabaseClient } from '@/src/lib/supabase'

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .eq('user_id', user.id)
  
  return <div>{/* Your component */}</div>
}
```

#### Client-Side Database Operations
```typescript
import { supabase } from '@/src/lib/supabase'

const handleSubmit = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .insert({ title: 'New Item' })
    .select()
}
```

#### API Routes
```typescript
import { createServerSupabaseClient } from '@/src/lib/supabase'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('your_table').select('*')
  return NextResponse.json({ data })
}
```

## 5. Configure Authentication Settings

### Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, make sure it's enabled
3. Configure email templates if desired

### OAuth Providers (Optional)

#### Google OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

#### GitHub OAuth
1. Go to **Authentication** → **Providers**
2. Enable **GitHub**
3. Add your GitHub OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

#### Discord OAuth
1. Go to **Authentication** → **Providers**
2. Enable **Discord**
3. Add your Discord OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 6. Configure Site URL

1. Go to **Authentication** → **Settings**
2. Set your **Site URL**:
   - Production: `https://your-domain.com`
   - Development: `http://localhost:3000`
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback`

## 7. Create Database Tables (Optional)

If you want to store additional user profile information, you can create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 8. Database Helper Functions

The application includes helper functions for common database operations:

```typescript
import { database } from '@/src/lib/supabase'

// Query data
const { data, error } = await database.query('your_table', {
  where: { user_id: userId },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10
})

// Insert data
const { data, error } = await database.insert('your_table', {
  title: 'New Item',
  user_id: userId
})

// Update data
const { data, error } = await database.update('your_table', 
  { completed: true }, 
  { id: itemId, user_id: userId }
)

// Delete data
const { data, error } = await database.delete('your_table', {
  id: itemId,
  user_id: userId
})
```

## 9. Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signup`
3. Try creating an account with email/password
4. Test OAuth providers if configured
5. Verify email confirmation works
6. Test database operations in your components

## 10. Production Deployment

When deploying to production:

1. Update your environment variables with production Supabase credentials
2. Update your Supabase project settings with your production domain
3. Configure your OAuth providers with production redirect URIs
4. Test authentication flow in production
5. Verify database operations work correctly

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Make sure you're using the `anon` key, not the `service_role` key

2. **OAuth redirect errors**
   - Verify redirect URIs are correctly configured in both Supabase and OAuth provider
   - Check that your site URL is set correctly in Supabase

3. **Email not sending**
   - Check your Supabase project's email settings
   - Verify your domain is configured for email sending

4. **CORS errors**
   - Add your domain to the allowed origins in Supabase settings

5. **Database connection errors**
   - Verify your Supabase URL and API key are correct
   - Check that your database tables exist and have proper RLS policies

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase) 
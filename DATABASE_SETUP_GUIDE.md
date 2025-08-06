# 🗄️ Database Setup Guide

This guide will help you fix the "profiles table does not exist" error by setting up your database schema.

## 🚨 The Problem

The error you're seeing:
```
ERROR: relation "profiles" does not exist (SQLSTATE 42P01)
```

This happens because:
1. Your application expects a `profiles` table to exist
2. When users sign up, a trigger tries to create a profile record
3. The table doesn't exist in your database yet

## 🔧 The Solution

You need to run the database schema setup in your self-hosted Supabase instance.

## 📋 Step-by-Step Instructions

### Step 1: Access Your Supabase Dashboard

1. **Open your browser** and go to:
   ```
   http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me
   ```

2. **Login with**:
   - Username: `supabase`
   - Password: `bd28npwzzlc3wyccugxcponwb5opkeul`

### Step 2: Open the SQL Editor

1. **Navigate to** the SQL Editor:
   - Click on **"SQL Editor"** in the left sidebar
   - Or go to **Database** → **SQL Editor**

### Step 3: Run the Database Setup

1. **Copy the contents** of the `setup_database.sql` file
2. **Paste it** into the SQL Editor
3. **Click "Run"** to execute the script

### Step 4: Verify the Setup

After running the script, you can verify it worked by running these queries:

```sql
-- Check if the profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- Check if the trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE table_name = 'profiles';

-- Check if the function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

## 🧪 Test the Fix

### 1. **Try Signing Up Again**
- Go to `http://localhost:3000/auth/signup`
- Create a new account
- The error should be gone

### 2. **Check the Database**
- In your Supabase dashboard, go to **Table Editor**
- Look for the `profiles` table
- You should see a new profile record for your test user

## 📊 What Gets Created

The setup script creates:

### Tables
- **`profiles`** - Stores user profile information

### Functions
- **`handle_new_user()`** - Automatically creates profiles for new users
- **`update_updated_at_column()`** - Updates timestamps

### Triggers
- **`on_auth_user_created`** - Fires when a new user signs up
- **`update_profiles_updated_at`** - Updates timestamps on profile changes

### Indexes
- **`idx_profiles_username`** - For fast username lookups
- **`idx_profiles_created_at`** - For fast date-based queries

### Security Policies
- **Row Level Security (RLS)** enabled
- **Policies** for users to manage their own profiles

## 🔒 Security Features

The setup includes:

- **Row Level Security (RLS)** - Users can only access their own data
- **Proper permissions** - Authenticated users can manage their profiles
- **Automatic profile creation** - No manual intervention needed

## 🚨 Troubleshooting

### If the script fails:

1. **Check for existing tables**:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

2. **Check for existing functions**:
   ```sql
   SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
   ```

3. **Check for existing triggers**:
   ```sql
   SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
   ```

### If you still get errors:

1. **Check the logs** in your Supabase dashboard
2. **Verify the database connection** is working
3. **Make sure you have proper permissions** to create tables

## 📈 Next Steps

After fixing the database:

1. **Test all authentication methods**:
   - Email/password signup and login
   - Magic Link authentication
   - OTP authentication
   - OAuth providers

2. **Set up additional tables** (optional):
   - Run the full `supabase_schema.sql` for complete functionality
   - This includes analytics, file uploads, and more features

3. **Configure email templates**:
   - Go to **Authentication** → **Email Templates**
   - Customize the templates for your brand

## 🎯 Success Indicators

You'll know it's working when:

- ✅ User signup completes without errors
- ✅ Profile records are automatically created
- ✅ Users can log in successfully
- ✅ All authentication methods work
- ✅ No more "profiles table does not exist" errors

---

**After running the setup script, your authentication system should work perfectly!** 🚀 
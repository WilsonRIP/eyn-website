-- =====================================================
-- EYN Website - Safe Database Setup (Handles Existing Objects)
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the "profiles table does not exist" error
-- This version safely handles existing objects without errors

-- =====================================================
-- 1. PROFILES TABLE (Required for authentication)
-- =====================================================
-- This table stores additional user profile information beyond auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  location TEXT,
  timezone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE (Safe to run multiple times)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- =====================================================
-- 3. FUNCTION TO HANDLE NEW USER SIGNUPS (Safe to replace)
-- =====================================================
-- This function automatically creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCTION TO UPDATE TIMESTAMPS (Safe to replace)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS (Safe to drop and recreate)
-- =====================================================

-- Drop existing triggers if they exist (safe operation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES (Safe to run multiple times)
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. GRANT PERMISSIONS (Safe to run multiple times)
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 8. VERIFICATION QUERY
-- =====================================================
-- Run this to verify the setup worked:

-- Simple verification queries (run these separately if needed):

-- Check if profiles table exists
SELECT 'profiles table exists' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'profiles'
);

-- Check if handle_new_user function exists
SELECT 'handle_new_user function exists' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'
);

-- Check if triggers exist
SELECT 'triggers exist' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_schema = 'public' AND event_object_table = 'profiles'
);

-- =====================================================
-- 9. CREATE MISSING PROFILES FOR EXISTING USERS (Optional)
-- =====================================================
-- Run this if you have existing users without profiles

INSERT INTO profiles (id, username, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)) as username,
  u.created_at,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING; 
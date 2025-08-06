-- =====================================================
-- EYN Website - Essential Database Setup
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the "profiles table does not exist" error

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
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- =====================================================
-- 3. FUNCTION TO HANDLE NEW USER SIGNUPS
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
-- 4. FUNCTION TO UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger for new user signups (creates profile automatically)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for the trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 8. VERIFICATION QUERY
-- =====================================================
-- Run this to verify the setup worked:

-- SELECT 
--   table_name, 
--   trigger_name, 
--   event_manipulation, 
--   action_statement
-- FROM information_schema.triggers 
-- WHERE table_name = 'profiles';

-- SELECT 
--   schemaname, 
--   tablename, 
--   indexname 
-- FROM pg_indexes 
-- WHERE tablename = 'profiles'; 
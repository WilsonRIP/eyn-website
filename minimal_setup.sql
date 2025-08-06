-- =====================================================
-- Minimal Database Setup (Basic Authentication Only)
-- =====================================================
-- This is a simplified setup to get authentication working quickly

-- =====================================================
-- 1. CREATE PROFILES TABLE (Minimal)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE SIMPLE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 4. BASIC PERMISSIONS
-- =====================================================

GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 5. SIMPLE RLS (Optional - comment out if causing issues)
-- =====================================================

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can update own profile" ON profiles
--   FOR UPDATE USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can insert own profile" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 6. VERIFICATION
-- =====================================================

SELECT 'Minimal setup completed' as status; 
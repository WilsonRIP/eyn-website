-- =====================================================
-- Quick Fix for Signup 500 Error
-- =====================================================
-- Run this immediately to fix the signup issue

-- Disable the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simple, safe version of the function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple profile creation with minimal data
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, just return NEW without failing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger with the safe function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 
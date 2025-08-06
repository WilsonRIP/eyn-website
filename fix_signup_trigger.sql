-- =====================================================
-- Fix for Signup Trigger Function
-- =====================================================
-- This fixes the 500 error during user signup

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a more robust handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_avatar_url TEXT;
  user_username TEXT;
BEGIN
  -- Safely extract values from raw_user_meta_data
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', '');
  
  -- Generate a username if not provided
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL AND NEW.raw_user_meta_data->>'username' != '' THEN
    user_username := NEW.raw_user_meta_data->>'username';
  ELSE
    user_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Insert the profile with safe values
  INSERT INTO profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    user_full_name,
    user_avatar_url,
    user_username
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    INSERT INTO error_logs (error_type, error_message, context)
    VALUES (
      'profile_creation_error',
      'Failed to create profile for user: ' || NEW.id,
      jsonb_build_object(
        'user_id', NEW.id,
        'error', SQLERRM,
        'raw_user_meta_data', NEW.raw_user_meta_data
      )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Alternative: Disable the trigger temporarily
-- =====================================================
-- If you want to disable the automatic profile creation temporarily,
-- uncomment the line below:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- Manual profile creation function
-- =====================================================
-- This function can be called manually to create profiles

CREATE OR REPLACE FUNCTION create_user_profile(user_id UUID)
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user data from auth.users
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF user_record IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN; -- Profile already exists
  END IF;

  -- Create profile
  INSERT INTO profiles (id, full_name, avatar_url, username)
  VALUES (
    user_id,
    COALESCE(user_record.raw_user_meta_data->>'full_name', ''),
    COALESCE(user_record.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(
      user_record.raw_user_meta_data->>'username',
      'user_' || substr(user_id::text, 1, 8)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
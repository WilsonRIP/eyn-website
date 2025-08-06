-- =====================================================
-- Database Diagnostic Script
-- =====================================================
-- Run this to check what's causing the 500 error during signup

-- =====================================================
-- 1. CHECK IF PROFILES TABLE EXISTS
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN '✅ profiles table exists'
    ELSE '❌ profiles table does NOT exist'
  END as table_status;

-- =====================================================
-- 2. CHECK TABLE STRUCTURE
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK IF FUNCTION EXISTS
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'
    ) THEN '✅ handle_new_user function exists'
    ELSE '❌ handle_new_user function does NOT exist'
  END as function_status;

-- =====================================================
-- 4. CHECK FUNCTION DEFINITION
-- =====================================================

SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- =====================================================
-- 5. CHECK IF TRIGGER EXISTS
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'profiles';

-- =====================================================
-- 6. CHECK AUTH.USERS TRIGGER
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'users' AND event_object_schema = 'auth';

-- =====================================================
-- 7. CHECK PERMISSIONS
-- =====================================================

SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- =====================================================
-- 8. CHECK ROW LEVEL SECURITY
-- =====================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- =====================================================
-- 9. CHECK POLICIES
-- =====================================================

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- =====================================================
-- 10. TEST FUNCTION MANUALLY (if table exists)
-- =====================================================

-- This will help identify if the function has any issues
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_meta JSONB := '{"full_name": "Test User", "username": "testuser"}'::jsonb;
BEGIN
  -- Check if we can call the function
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'
  ) THEN
    RAISE NOTICE 'Function exists, testing...';
    
    -- Try to call the function (this might fail, but will show the error)
    BEGIN
      PERFORM handle_new_user();
      RAISE NOTICE 'Function call succeeded';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Function call failed: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Function does not exist';
  END IF;
END $$; 
-- =====================================================
-- Database Connection Test
-- =====================================================
-- Run this to verify your database is working correctly

-- Test 1: Check if we can read from auth.users
SELECT COUNT(*) as user_count FROM auth.users;

-- Test 2: Check if profiles table exists and is accessible
SELECT COUNT(*) as profile_count FROM profiles;

-- Test 3: Check if the trigger function exists
SELECT 
    routine_name, 
    routine_type, 
    routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Test 4: Check if the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test 5: Test the manual profile creation function
-- (This will only work if you have a user to test with)
-- SELECT create_user_profile('your-user-id-here');

-- Test 6: Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'; 
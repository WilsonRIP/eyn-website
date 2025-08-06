-- =====================================================
-- Development Email Bypass
-- =====================================================
-- This manually confirms a user's email for development testing
-- ONLY USE THIS FOR DEVELOPMENT - NOT FOR PRODUCTION!

-- Find your user ID first
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'luke.austin.gatz@gmail.com';

-- Manually confirm the email (replace USER_ID with your actual user ID)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Verify the update worked
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'luke.austin.gatz@gmail.com'; 
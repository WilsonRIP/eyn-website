-- =====================================================
-- Email Confirmation Diagnostic Tool
-- =====================================================
-- Run this in your Supabase SQL Editor to diagnose email issues

-- Check recent user signups
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NOT CONFIRMED'
        ELSE 'CONFIRMED'
    END as confirmation_status,
    raw_user_meta_data
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check if there are any unconfirmed users
SELECT 
    COUNT(*) as unconfirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check recent auth events (if you have logging enabled)
-- This will show recent signup attempts
-- Note: This table might not exist in all Supabase setups
-- SELECT 
--     event_type,
--     created_at,
--     ip_address,
--     user_agent
-- FROM auth.audit_log_entries 
-- WHERE event_type = 'signup'
-- AND created_at > NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- Check if profiles table has entries for recent users
SELECT 
    p.id,
    p.username,
    p.created_at,
    u.email,
    u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC; 
-- =====================================================
-- Simple Email Confirmation Diagnostic
-- =====================================================
-- This script only uses tables that definitely exist in Supabase

-- 1. Check recent user signups (last 24 hours)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
        ELSE '✅ CONFIRMED'
    END as confirmation_status
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 2. Count unconfirmed vs confirmed users
SELECT 
    COUNT(*) as total_users_24h,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 3. Check profiles for recent users
SELECT 
    p.id,
    p.username,
    p.created_at as profile_created,
    u.email,
    u.created_at as user_created,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
        ELSE '✅ Email confirmed'
    END as email_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
ORDER BY p.created_at DESC;

-- 4. Check for any users without profiles (shouldn't happen with our trigger)
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ No profile created'
        ELSE '✅ Profile exists'
    END as profile_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at > NOW() - INTERVAL '24 hours'
ORDER BY u.created_at DESC; 
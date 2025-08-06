-- =====================================================
-- Enable Email Confirmation via SQL
-- =====================================================
-- This script enables email confirmation settings directly in the database

-- Check current auth configuration
SELECT 
    key,
    value
FROM auth.config 
WHERE key LIKE '%email%' OR key LIKE '%confirm%';

-- Update email confirmation settings
-- Note: These settings might be stored in a different table or format
-- depending on your Supabase version

-- Try to update auth configuration
UPDATE auth.config 
SET value = 'true'::jsonb
WHERE key = 'enable_confirmations';

-- If the above doesn't work, try this alternative:
-- INSERT INTO auth.config (key, value) 
-- VALUES ('enable_confirmations', 'true'::jsonb)
-- ON CONFLICT (key) DO UPDATE SET value = 'true'::jsonb;

-- Check if the update worked
SELECT 
    key,
    value
FROM auth.config 
WHERE key LIKE '%email%' OR key LIKE '%confirm%'; 
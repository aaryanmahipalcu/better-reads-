-- Admin Setup Script - Run this AFTER the main setup
-- Use this to make your first user an admin

-- ===========================================
-- SET UP YOUR FIRST ADMIN USER
-- ===========================================

-- Option 1: Make a user admin by username
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE username = 'your-username-here';

-- Option 2: Make a user admin by email (if you have email in profiles)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your-email@example.com'
-- );

-- Option 3: Make the first user admin (useful for testing)
-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE id = (
--   SELECT id FROM public.profiles 
--   ORDER BY created_at ASC 
--   LIMIT 1
-- );

-- ===========================================
-- VERIFY ADMIN SETUP
-- ===========================================

-- Check current admin users
SELECT username, is_admin, created_at 
FROM public.profiles 
WHERE is_admin = true;

-- Test admin function
SELECT public.is_admin() as is_current_user_admin; 
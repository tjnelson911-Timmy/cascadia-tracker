-- ============================================
-- Reset All User Passwords to "Cascadia1"
-- ============================================
-- Run this in Supabase SQL Editor

-- Update all user passwords to "Cascadia1"
UPDATE auth.users
SET encrypted_password = crypt('Cascadia1', gen_salt('bf')),
    updated_at = NOW();

-- Require password change on next login
UPDATE public.profiles
SET must_change_password = true;

-- Verify the update
SELECT
  p.full_name,
  u.email,
  'Cascadia1' as new_password
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.full_name;

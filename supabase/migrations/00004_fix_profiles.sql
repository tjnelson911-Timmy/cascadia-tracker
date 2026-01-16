-- ============================================
-- Fix: Manually insert profiles for existing users
-- ============================================
-- The trigger may not have fired, so we need to create profiles manually

-- First, let's see what users exist
SELECT id, email, raw_user_meta_data->>'full_name' as full_name
FROM auth.users;

-- Now insert profiles for each auth user that doesn't have one
INSERT INTO public.profiles (id, full_name, must_change_password)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Unknown User'),
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Verify profiles were created
SELECT * FROM public.profiles ORDER BY full_name;

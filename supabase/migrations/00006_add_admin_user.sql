-- ============================================
-- Add Admin User and is_admin Column
-- ============================================
-- Run this in Supabase SQL Editor

-- Add is_admin column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create the Admin user
DO $$
DECLARE
  admin_id UUID;
  hashed_password TEXT;
BEGIN
  -- Hash the password "Admin"
  hashed_password := crypt('Admin', gen_salt('bf'));

  -- Generate a UUID for the admin
  admin_id := gen_random_uuid();

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    aud,
    role
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Admin"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- Update the auto-created profile to mark as admin and not require password change
  UPDATE public.profiles
  SET is_admin = true, must_change_password = false
  WHERE id = admin_id;

END $$;

-- Verify admin was created
SELECT
  p.full_name,
  u.email,
  p.is_admin,
  p.must_change_password
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true;

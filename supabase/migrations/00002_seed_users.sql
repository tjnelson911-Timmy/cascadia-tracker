-- ============================================
-- Cascadia Leadership Presence Tracker
-- Seed Users
-- ============================================
-- Run this in Supabase SQL Editor AFTER 00001_initial_schema.sql
-- Creates 5 users with default password: Cascadia2026

-- Enable the required extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CREATE SEED USERS
-- ============================================
-- Using Supabase's auth.users table directly
-- The trigger from 00001 will auto-create profiles

-- Helper function to create users with hashed passwords
DO $$
DECLARE
  user_id UUID;
  hashed_password TEXT;
BEGIN
  -- Hash the default password (Cascadia2026)
  -- Supabase uses bcrypt for password hashing
  hashed_password := crypt('Cascadia2026', gen_salt('bf'));

  -- User 1: Tim Nelson
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'tim.nelson@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Tim Nelson"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- User 2: Owen Hammond
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'owen.hammond@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Owen Hammond"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- User 3: Steve LaForte
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'steve.laforte@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Steve LaForte"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- User 4: Chase Gunderson
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'chase.gunderson@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Chase Gunderson"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- User 5: Holly Chavez
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'holly.chavez@cascadia.local',
    hashed_password,
    NOW(),
    '{"full_name": "Holly Chavez"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

END $$;

-- Verify users were created
SELECT
  p.full_name,
  u.email,
  p.must_change_password
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.full_name;

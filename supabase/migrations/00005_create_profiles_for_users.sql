-- ============================================
-- Create profiles for the dashboard-created users
-- ============================================

-- First check what users exist
SELECT id, email FROM auth.users;

-- Delete any existing profiles (in case of duplicates)
DELETE FROM public.profiles;

-- Insert profiles with proper names based on email
INSERT INTO public.profiles (id, full_name, must_change_password)
SELECT
  id,
  CASE
    WHEN email = 'tim.nelson@cascadia.local' THEN 'Tim Nelson'
    WHEN email = 'owen.hammond@cascadia.local' THEN 'Owen Hammond'
    WHEN email = 'steve.laforte@cascadia.local' THEN 'Steve LaForte'
    WHEN email = 'chase.gunderson@cascadia.local' THEN 'Chase Gunderson'
    WHEN email = 'holly.chavez@cascadia.local' THEN 'Holly Chavez'
    ELSE 'Unknown User'
  END,
  true
FROM auth.users;

-- Verify
SELECT p.full_name, u.email, p.must_change_password
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.full_name;

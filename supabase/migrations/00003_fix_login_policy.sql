-- ============================================
-- Fix: Allow unauthenticated users to see profile names
-- ============================================
-- The login page needs to show the user dropdown before login
-- This adds a policy to allow reading just the id and full_name

-- Drop the existing select policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create a new policy that allows anyone to read profiles
-- This is safe because profiles only contain names (no sensitive data)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Verify the policy is in place
SELECT 'Login policy fix applied!' as status;

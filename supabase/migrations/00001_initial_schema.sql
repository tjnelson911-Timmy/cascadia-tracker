-- ============================================
-- Cascadia Leadership Presence Tracker
-- Initial Database Schema
-- ============================================
-- Run this SQL in Supabase: SQL Editor > New Query > Paste > Run

-- ============================================
-- TABLE 1: profiles
-- ============================================
-- Stores user information (extends Supabase auth.users)
-- Each user in auth.users gets a matching profile here

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (protects data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (needed for dropdown)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- TABLE 2: facilities
-- ============================================
-- Stores all facilities (imported from CSV)
-- Regular users cannot modify this table

CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('SNF', 'AL', 'IL', 'Hospice')),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read facilities
CREATE POLICY "Facilities are viewable by authenticated users"
  ON public.facilities FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- TABLE 3: visits
-- ============================================
-- Stores ALL visits (including repeat visits to same facility)
-- Used for timeline and map playback

CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all visits (needed for collective stats)
CREATE POLICY "Visits are viewable by authenticated users"
  ON public.visits FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can only create their own visits
CREATE POLICY "Users can create own visits"
  ON public.visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE 4: facility_completions
-- ============================================
-- Tracks FIRST visit only per user per facility
-- The UNIQUE constraint ensures only one entry per user-facility pair
-- Used for calculating completion percentage

CREATE TABLE public.facility_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  first_visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, facility_id)
);

-- Enable Row Level Security
ALTER TABLE public.facility_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all completions (needed for collective stats)
CREATE POLICY "Completions are viewable by authenticated users"
  ON public.facility_completions FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can only create their own completions
CREATE POLICY "Users can create own completions"
  ON public.facility_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE: visit-photos bucket
-- ============================================
-- Creates a storage bucket for visit photos

INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', false);

-- Policy: Authenticated users can upload to visit-photos
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'visit-photos');

-- Policy: Authenticated users can view photos
CREATE POLICY "Authenticated users can view photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'visit-photos');

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
-- When a new user signs up, automatically create their profile

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run handle_new_user when a new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this, all tables were created successfully!
SELECT 'Database schema created successfully!' as status;

/**
 * Database Types
 *
 * WHY THIS FILE?
 * TypeScript needs to know the shape of your data.
 * These types match your database tables exactly.
 * This gives you:
 * - Autocomplete when writing code
 * - Error checking if you use wrong field names
 * - Better documentation of your data structure
 */

export type FacilityType = 'SNF' | 'AL' | 'IL' | 'Hospice'

export interface Profile {
  id: string
  full_name: string
  must_change_password: boolean
  created_at: string
}

export interface Facility {
  id: string
  name: string
  address: string
  facility_type: FacilityType
  latitude: number
  longitude: number
  created_at: string
}

export interface Visit {
  id: string
  user_id: string
  facility_id: string
  photo_url: string
  visit_date: string
  note: string | null
  created_at: string
}

export interface FacilityCompletion {
  id: string
  user_id: string
  facility_id: string
  first_visit_id: string
  completed_at: string
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      facilities: {
        Row: Facility
        Insert: Omit<Facility, 'id' | 'created_at'>
        Update: Partial<Omit<Facility, 'id' | 'created_at'>>
      }
      visits: {
        Row: Visit
        Insert: Omit<Visit, 'id' | 'created_at'>
        Update: Partial<Omit<Visit, 'id' | 'created_at'>>
      }
      facility_completions: {
        Row: FacilityCompletion
        Insert: Omit<FacilityCompletion, 'id' | 'completed_at'>
        Update: Partial<Omit<FacilityCompletion, 'id' | 'completed_at'>>
      }
    }
  }
}

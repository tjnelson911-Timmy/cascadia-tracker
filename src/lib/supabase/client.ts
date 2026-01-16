/**
 * Browser-side Supabase client
 *
 * WHY THIS FILE?
 * This creates a Supabase client that works in the browser (React components).
 * It handles:
 * - Connecting to your Supabase project
 * - Managing user sessions (login state)
 * - Making API calls to your database
 *
 * WHEN TO USE:
 * Import this in any React component that needs to talk to Supabase.
 * Example: Login forms, data fetching in client components
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

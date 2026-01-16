/**
 * Test API Route - Debug Supabase connection
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // Create a client directly (not using the server helper)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Test 1: Basic connection
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  // Test 2: Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables_info')
    .select()

  return NextResponse.json({
    env: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    },
    profiles: {
      data: profiles,
      error: profilesError?.message,
    },
    tables: {
      data: tables,
      error: tablesError?.message,
    },
  })
}

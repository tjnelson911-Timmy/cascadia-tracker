/**
 * Server-side Supabase client
 *
 * WHY THIS FILE?
 * This creates a Supabase client that works on the server (API routes, Server Components).
 * It handles:
 * - Reading/writing cookies for user sessions
 * - Secure server-side database operations
 *
 * WHEN TO USE:
 * Import this in:
 * - Server Components (files without "use client")
 * - API Route handlers (app/api/...)
 * - Server Actions
 *
 * WHY IS IT MORE COMPLEX?
 * The server needs special cookie handling because HTTP is stateless.
 * Cookies carry the user's session from request to request.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

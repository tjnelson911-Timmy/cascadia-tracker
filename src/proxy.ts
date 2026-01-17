/**
 * Next.js Middleware for Supabase Auth
 *
 * WHY THIS FILE?
 * This runs on EVERY request before your pages load.
 * It keeps the user's login session fresh by:
 * - Checking if the session is about to expire
 * - Automatically refreshing it if needed
 *
 * Without this, users would get logged out randomly.
 *
 * HOW IT WORKS:
 * 1. User makes a request
 * 2. Middleware checks their session cookie
 * 3. If session is expiring soon, it gets a fresh one from Supabase
 * 4. New session cookie is set in the response
 * 5. Request continues to your page
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session - this is the key operation
  await supabase.auth.getUser()

  return supabaseResponse
}

// Only run middleware on these paths (not on static files, images, etc.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

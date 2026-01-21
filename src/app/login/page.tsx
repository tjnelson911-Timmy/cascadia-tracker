/**
 * Login Page
 *
 * WHY THIS FILE?
 * This is the main login page for Leadership Presence Tracker.
 * It displays:
 * - Leadership quotes scattered around the page
 * - A featured quote prominently displayed
 * - A dropdown of all users (fetched from database)
 * - A password input field
 * - A login button
 *
 * HOW IT WORKS:
 * 1. Server fetches all user profiles from Supabase
 * 2. Passes them to the client component
 * 3. User selects their name and enters password
 * 4. Form submits to login action
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './login-form'
import { getFeaturedQuote } from '@/lib/quotes'

export default async function LoginPage() {
  const supabase = await createClient()

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Check if they need to change password
    const { data: profile } = await supabase
      .from('profiles')
      .select('must_change_password')
      .eq('id', user.id)
      .single()

    if (profile?.must_change_password) {
      redirect('/change-password')
    }
    redirect('/dashboard')
  }

  // Fetch all users for the dropdown using RPC function
  // This function bypasses RLS issues and returns all profiles
  const { data: profiles, error } = await supabase
    .rpc('get_all_profiles')

  // Debug logging
  console.log('Profiles query result:', { profiles, error })
  if (error) {
    console.error('Error fetching profiles:', error)
  }

  // Filter out admin users from the dropdown (they use a separate login)
  const teamProfiles = (profiles || []).filter(
    (p: { full_name: string }) => p.full_name !== 'Admin'
  )

  const featuredQuote = getFeaturedQuote()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cascadia-900 via-cascadia-800 to-cascadia-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cascadia-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cascadia-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Cascadia Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img
          src="/cascadia-large.png"
          alt=""
          className="w-[400px] sm:w-[600px] md:w-[800px] lg:w-[1000px] opacity-[0.30]"
        />
      </div>


      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        {/* Featured Quote - Big and Prominent */}
        {featuredQuote && (
          <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-10 px-2">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-snug sm:leading-relaxed italic drop-shadow-lg">
              &ldquo;{featuredQuote.text}&rdquo;
            </p>
          </div>
        )}

        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-6 sm:mb-8">
            <img
              src="/CL-white.png"
              alt="Cascadia"
              className="h-16 sm:h-20 mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight">
              Leadership Presence Tracker
            </h1>
            <p className="text-cascadia-200 mt-2 sm:mt-3 italic font-light text-sm sm:text-lg">
              &ldquo;Leaders show up whether they feel like it or not.&rdquo;
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6 text-center">
              Sign In
            </h2>

            <LoginForm users={teamProfiles} />
          </div>

          {/* Footer Quote */}
          <p className="text-center text-xs sm:text-sm text-cascadia-200/70 mt-6 sm:mt-8 italic font-light max-w-sm mx-auto">
            &ldquo;Real leadership begins where comfort ends.&rdquo;
          </p>

          {/* Admin Login Link */}
          <p className="text-center text-sm text-cascadia-200 mt-6">
            <a href="/admin/login" className="underline hover:text-white transition-colors">
              Admin Login
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

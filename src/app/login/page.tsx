/**
 * Login Page
 *
 * WHY THIS FILE?
 * This is the main login page for Cascadia Leadership Presence Tracker.
 * It displays:
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Cascadia
          </h1>
          <p className="text-slate-500 mt-2">
            Leadership Presence Tracker
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
            Sign In
          </h2>

          <LoginForm users={profiles || []} />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Private application for Cascadia leadership team
        </p>
      </div>
    </div>
  )
}

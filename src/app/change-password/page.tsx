/**
 * Change Password Page
 *
 * WHY THIS FILE?
 * Users are redirected here after first login.
 * They must change from the default password (Cascadia2026)
 * to a new password of their choice.
 *
 * SECURITY:
 * - Validates new password meets requirements
 * - Updates password in Supabase Auth
 * - Sets must_change_password to false in profile
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChangePasswordForm from './change-password-form'

export default async function ChangePasswordPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, must_change_password')
    .eq('id', user.id)
    .single()

  // If they don't need to change password, redirect to dashboard
  if (!profile?.must_change_password) {
    redirect('/dashboard')
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

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-2 text-center">
            Welcome, {profile.full_name}!
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm">
            Please create a new password to continue.
          </p>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}

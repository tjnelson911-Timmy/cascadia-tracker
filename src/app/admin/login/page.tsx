/**
 * Admin Login Page
 *
 * Separate login page for admin users.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLoginForm from './admin-login-form'

export default async function AdminLoginPage() {
  const supabase = await createClient()

  // Check if already logged in as admin
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin) {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-2">Access the admin panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <AdminLoginForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <a href="/login" className="text-cascadia-400 hover:text-cascadia-300">
            Back to team login
          </a>
        </p>
      </div>
    </div>
  )
}

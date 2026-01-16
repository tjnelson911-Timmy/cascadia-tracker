/**
 * Home Page - Redirects to Login
 *
 * WHY THIS FILE?
 * The root path (/) should redirect users appropriately:
 * - If logged in and password changed -> Dashboard
 * - If logged in but needs password change -> Change Password
 * - If not logged in -> Login
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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

/**
 * Admin Panel Page
 *
 * Main admin dashboard with tabs:
 * - Admin Functions (links to visits, users, facilities)
 * - Facilities list with search and filters
 */

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminTabs from './admin-tabs'

export default async function AdminPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get counts for display (exclude admin from user count)
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', false)

  const { count: facilityCount } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })

  const { count: visitCount } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })

  // Get all facilities for the facilities tab
  const { data: facilities } = await supabase
    .from('facilities')
    .select('id, facility_name, type, address, city, state, county, company, team')
    .order('facility_name')

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-300">Manage users and facilities</p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Log Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AdminTabs
          facilities={facilities || []}
          userCount={userCount ?? 0}
          facilityCount={facilityCount ?? 0}
          visitCount={visitCount ?? 0}
        />
      </main>
    </div>
  )
}

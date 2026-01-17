/**
 * Admin All Visits Page
 *
 * Shows all visits from all team members.
 * Admin-only access.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminVisitsList from './admin-visits-list'

export default async function AdminAllVisitsPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get all visits from all users with facility and user info
  const { data: visits } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
      photo_url,
      created_at,
      user_id,
      profiles (
        full_name
      ),
      facilities (
        id,
        facility_name,
        type,
        address,
        city,
        state
      )
    `)
    .order('visit_date', { ascending: false })

  // Generate signed URLs for photos
  const visitsWithPhotoUrls = await Promise.all(
    (visits || []).map(async (visit) => {
      let signedPhotoUrl = null
      if (visit.photo_url) {
        const { data } = await supabase.storage
          .from('visit-photos')
          .createSignedUrl(visit.photo_url, 3600)
        signedPhotoUrl = data?.signedUrl || null
      }
      return {
        ...visit,
        signedPhotoUrl,
        user_name: (visit.profiles as unknown as { full_name: string })?.full_name || 'Unknown',
      }
    })
  )

  // Get unique facility types for filter
  const facilityTypes = [...new Set(
    visits?.map(v => (v.facilities as unknown as { type: string })?.type).filter(Boolean)
  )]

  // Get unique user names for filter
  const userNames = [...new Set(
    visitsWithPhotoUrls.map(v => v.user_name).filter(Boolean)
  )].sort()

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">All Team Visits</h1>
              <p className="text-sm text-slate-300">{visits?.length || 0} total visits from all team members</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AdminVisitsList
          visits={visitsWithPhotoUrls}
          facilityTypes={facilityTypes}
          userNames={userNames}
        />
      </main>
    </div>
  )
}

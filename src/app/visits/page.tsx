/**
 * View All Visits Page
 *
 * Shows all visits with filtering and search.
 * Allows editing and deleting visits.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VisitsList from './visits-list'

export default async function VisitsPage() {
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

  if (profile?.must_change_password) {
    redirect('/change-password')
  }

  // Get all visits with facility info
  const { data: visits } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
      photo_url,
      created_at,
      facilities (
        id,
        facility_name,
        type,
        address,
        city,
        state
      )
    `)
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })

  // Generate signed URLs for photos
  const visitsWithPhotoUrls = await Promise.all(
    (visits || []).map(async (visit) => {
      if (visit.photo_url) {
        const { data } = await supabase.storage
          .from('visit-photos')
          .createSignedUrl(visit.photo_url, 3600)
        return { ...visit, signedPhotoUrl: data?.signedUrl }
      }
      return { ...visit, signedPhotoUrl: null }
    })
  )

  // Get unique facility types for filter
  const facilityTypes = [...new Set(
    visits?.map(v => (v.facilities as unknown as { type: string })?.type).filter(Boolean)
  )]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cascadia</h1>
            <p className="text-sm text-slate-500">Leadership Presence Tracker</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 hidden sm:inline">{profile?.full_name}</span>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">All Visits</h2>
            <p className="text-slate-500">{visits?.length || 0} total visits recorded</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Record Visit
          </Link>
        </div>

        <VisitsList
          visits={visitsWithPhotoUrls}
          facilityTypes={facilityTypes}
        />
      </main>
    </div>
  )
}

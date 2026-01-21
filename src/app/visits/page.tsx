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
import QuoteBanner from '@/components/quote-banner'

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
    <div className="min-h-screen bg-slate-100">
      {/* Header - matching dashboard */}
      <header className="bg-gradient-to-r from-cascadia-600 to-cascadia-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/CL-white.png" alt="Cascadia" className="h-8 sm:h-10" />
              <div>
                <h1 className="text-2xl font-bold text-white">Leadership Presence Tracker</h1>
                <p className="text-sm text-cascadia-100 hidden sm:block italic font-light">&ldquo;Leadership isn&apos;t about being perfect. It&apos;s about being present.&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/admin/users"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
              >
                Team Visits
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-white/80 hidden md:block">{profile?.full_name}</span>
            </div>
          </div>
          {/* Mobile Nav */}
          <div className="flex gap-2 mt-3 sm:hidden overflow-x-auto pb-1">
            <Link
              href="/admin/users"
              className="px-3 py-1.5 text-sm font-medium text-white bg-white/20 rounded-lg whitespace-nowrap"
            >
              Team Visits
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-sm font-medium text-white bg-white/20 rounded-lg whitespace-nowrap"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Quote Banner */}
      <QuoteBanner count={3} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">All Visits</h2>
            <p className="text-slate-500">{visits?.length || 0} total visits recorded</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 bg-cascadia-600 hover:bg-cascadia-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
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

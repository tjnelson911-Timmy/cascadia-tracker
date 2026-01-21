/**
 * Dashboard Page
 *
 * Server component that fetches data and passes to client component
 * for filtering and display.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if they need to change password
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, must_change_password, is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.must_change_password) {
    redirect('/change-password')
  }

  const isAdmin = profile?.is_admin || false

  // Get all facilities with extended fields for filtering
  const { data: allFacilities } = await supabase
    .from('facilities')
    .select(`
      id,
      facility_name,
      type,
      address,
      city,
      state,
      county,
      company,
      team,
      latitude,
      longitude
    `)

  // Get user's completions to mark visited facilities
  const { data: userCompletions } = await supabase
    .from('facility_completions')
    .select('facility_id, first_visit_id')
    .eq('user_id', user.id)

  // Get visit dates for completed facilities
  const completionVisitIds = userCompletions?.map(c => c.first_visit_id) || []
  const { data: completionVisits } = await supabase
    .from('visits')
    .select('id, visit_date')
    .in('id', completionVisitIds.length > 0 ? completionVisitIds : [''])

  // Create a map of facility_id to visit_date
  const visitDateMap = new Map<string, string>()
  userCompletions?.forEach(c => {
    const visit = completionVisits?.find(v => v.id === c.first_visit_id)
    if (visit) {
      visitDateMap.set(c.facility_id, visit.visit_date)
    }
  })

  // Merge facility data with visit status
  const facilitiesWithStatus = (allFacilities || []).map(f => ({
    ...f,
    visited: userCompletions?.some(c => c.facility_id === f.id) || false,
    visit_date: visitDateMap.get(f.id) || null,
  }))

  // Extract unique filter options
  const companies = [...new Set(
    (allFacilities || [])
      .map(f => f.company)
      .filter((c): c is string => c !== null && c !== '')
  )].sort()

  const teams = [...new Set(
    (allFacilities || [])
      .map(f => f.team)
      .filter((t): t is string => t !== null && t !== '')
  )].sort()

  const types = [...new Set(
    (allFacilities || [])
      .map(f => f.type)
      .filter((t): t is string => t !== null && t !== '')
  )].sort()

  // Get all visits for recent visits list (with facility details)
  const { data: allVisits } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
      photo_url,
      facility_id,
      facilities (
        facility_name,
        type,
        company,
        team
      )
    `)
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })

  // Generate signed URLs for photos
  const visitsWithPhotoUrls = await Promise.all(
    (allVisits || []).map(async (visit) => {
      let signedPhotoUrl = null
      if (visit.photo_url) {
        const { data } = await supabase.storage
          .from('visit-photos')
          .createSignedUrl(visit.photo_url, 3600)
        signedPhotoUrl = data?.signedUrl || null
      }
      return {
        id: visit.id,
        visit_date: visit.visit_date,
        note: visit.note,
        signedPhotoUrl,
        facility_id: visit.facility_id,
        facilities: visit.facilities as unknown as {
          facility_name: string
          type: string
          company: string | null
          team: string | null
        } | null,
      }
    })
  )

  // Get visits for timeline (with coordinates and filter fields)
  const { data: visitsForTimeline } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      facilities (
        facility_name,
        type,
        company,
        team,
        latitude,
        longitude
      )
    `)
    .eq('user_id', user.id)
    .order('visit_date', { ascending: true })

  const timelineVisits = (visitsForTimeline || []).map(v => {
    const facility = v.facilities as unknown as {
      facility_name: string
      type: string
      company: string | null
      team: string | null
      latitude: number | null
      longitude: number | null
    } | null
    return {
      id: v.id,
      visit_date: v.visit_date,
      facility_name: facility?.facility_name || 'Unknown',
      type: facility?.type || 'Unknown',
      company: facility?.company || null,
      team: facility?.team || null,
      latitude: facility?.latitude || null,
      longitude: facility?.longitude || null,
    }
  })

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-cascadia-600 to-cascadia-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/CL-white.png" alt="Cascadia" className="h-8 sm:h-10" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Leadership Presence Tracker</h1>
                <p className="text-xs sm:text-sm text-cascadia-100 hidden sm:block italic font-light">&ldquo;Leadership isn&apos;t about being perfect. It&apos;s about being present.&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-amber-200 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/admin/users"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
              >
                Team Visits
              </Link>
              <Link
                href="/visits"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
              >
                All Visits
              </Link>
              <span className="text-white/80 hidden md:block">{profile?.full_name}</span>
              <LogoutButton />
            </div>
          </div>
          {/* Mobile Nav */}
          <div className="flex gap-2 mt-3 sm:hidden overflow-x-auto pb-1">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-amber-200 bg-amber-500/30 rounded-lg whitespace-nowrap"
              >
                Admin
              </Link>
            )}
            <Link
              href="/admin/users"
              className="px-3 py-1.5 text-sm font-medium text-white bg-white/20 rounded-lg whitespace-nowrap"
            >
              Team Visits
            </Link>
            <Link
              href="/visits"
              className="px-3 py-1.5 text-sm font-medium text-white bg-white/20 rounded-lg whitespace-nowrap"
            >
              All Visits
            </Link>
            <Link
              href="/upload"
              className="px-3 py-1.5 text-sm font-medium text-white bg-white/30 rounded-lg whitespace-nowrap"
            >
              + Record
            </Link>
          </div>
        </div>
      </header>

      {/* Client-side dashboard with filters */}
      <DashboardClient
        userName={profile?.full_name?.split(' ')[0] || 'User'}
        facilities={facilitiesWithStatus}
        recentVisits={visitsWithPhotoUrls}
        timelineVisits={timelineVisits}
        filterOptions={{
          companies,
          teams,
          types,
        }}
      />
    </div>
  )
}

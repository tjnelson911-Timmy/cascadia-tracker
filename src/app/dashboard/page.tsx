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
    .select('full_name, must_change_password')
    .eq('id', user.id)
    .single()

  if (profile?.must_change_password) {
    redirect('/change-password')
  }

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Cascadia</h1>
              <p className="text-sm text-slate-500 hidden sm:block">Leadership Presence Tracker</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/visits"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              >
                All Visits
              </Link>
              <Link
                href="/admin/users"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              >
                Team
              </Link>
              <Link
                href="/admin/add-facility"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              >
                + Facility
              </Link>
              <span className="text-slate-600 hidden md:block">{profile?.full_name}</span>
              <LogoutButton />
            </div>
          </div>
          {/* Mobile Nav */}
          <div className="flex gap-2 mt-3 sm:hidden overflow-x-auto pb-1">
            <Link
              href="/visits"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap"
            >
              All Visits
            </Link>
            <Link
              href="/admin/users"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap"
            >
              Team
            </Link>
            <Link
              href="/admin/add-facility"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap"
            >
              + Facility
            </Link>
            <Link
              href="/upload"
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap"
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

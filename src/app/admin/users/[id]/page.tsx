/**
 * User Detail Page
 *
 * View a specific user's visits and progress.
 */

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ResetPasswordButton from './reset-password-button'
import DeleteUserButton from './delete-user-button'
import AvatarUpload from './avatar-upload'
import DeleteVisitButton from './delete-visit-button'
import AddVisitForm from './add-visit-form'
import FacilityList from './facility-list'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!currentProfile?.is_admin) {
    redirect('/dashboard')
  }

  // Get the target user's profile
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', id)
    .single()

  if (error || !targetProfile) {
    notFound()
  }

  // Get all facilities (for count, add-visit form, and facility list)
  const { data: allFacilities, count: totalFacilities } = await supabase
    .from('facilities')
    .select('id, facility_name, type, city, state', { count: 'exact' })
    .order('facility_name')

  // Get user's completions (facility IDs)
  const { data: userCompletions, count: facilitiesVisited } = await supabase
    .from('facility_completions')
    .select('facility_id', { count: 'exact' })
    .eq('user_id', id)

  const visitedFacilityIds = new Set((userCompletions || []).map(c => c.facility_id))

  // Get user's total visits
  const { count: totalVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  // Get user's recent visits with facility info
  const { data: recentVisitsRaw } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
      photo_url,
      facilities (
        facility_name,
        type,
        city,
        state
      )
    `)
    .eq('user_id', id)
    .order('visit_date', { ascending: false })
    .limit(20)

  // Generate signed URLs for photos
  const recentVisits = await Promise.all(
    (recentVisitsRaw || []).map(async (visit) => {
      let signedPhotoUrl: string | null = null
      if (visit.photo_url) {
        const { data } = await supabase.storage
          .from('visit-photos')
          .createSignedUrl(visit.photo_url, 3600)
        signedPhotoUrl = data?.signedUrl || null
      }
      return { ...visit, signedPhotoUrl }
    })
  )

  // Get visits by type
  const { data: allVisits } = await supabase
    .from('visits')
    .select('facilities(type)')
    .eq('user_id', id)

  const typeCountMap = new Map<string, number>()
  allVisits?.forEach(v => {
    const facility = v.facilities as unknown as { type: string } | null
    const type = facility?.type || 'Other'
    typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1)
  })

  const visitsByType = Array.from(typeCountMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  const completionPercentage = totalFacilities
    ? Math.round(((facilitiesVisited ?? 0) / totalFacilities) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cascadia</h1>
            <p className="text-sm text-slate-500">Leadership Presence Tracker</p>
          </div>
          <Link
            href="/admin/users"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ← Back to Team
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* User Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <AvatarUpload userId={id} currentAvatarUrl={targetProfile.avatar_url} />
              <h2 className="text-2xl font-semibold text-slate-800">
                {targetProfile.full_name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <ResetPasswordButton userId={id} userName={targetProfile.full_name} />
              <DeleteUserButton userId={id} userName={targetProfile.full_name} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Facilities Visited</p>
              <p className="text-2xl font-bold text-slate-800">
                {facilitiesVisited ?? 0}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Total Visits</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalVisits ?? 0}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Completion</p>
              <p className="text-2xl font-bold text-slate-800">
                {completionPercentage}%
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-2xl font-bold text-slate-800">
                {(totalFacilities ?? 0) - (facilitiesVisited ?? 0)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-cascadia-600 h-3 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <AddVisitForm userId={id} facilities={allFacilities || []} />

        {/* Facility List with toggle */}
        <FacilityList
          facilities={(allFacilities || []).map(f => ({
            ...f,
            visited: visitedFacilityIds.has(f.id),
          }))}
          recentVisits={recentVisits.map(v => {
            const facility = v.facilities as unknown as {
              facility_name: string
              type: string
              city: string | null
              state: string | null
            }
            return {
              id: v.id,
              visit_date: v.visit_date,
              signedPhotoUrl: v.signedPhotoUrl,
              facility_name: facility?.facility_name || '',
              type: facility?.type || '',
              city: facility?.city || null,
              state: facility?.state || null,
            }
          })}
          visitsByType={visitsByType}
        />
      </main>
    </div>
  )
}

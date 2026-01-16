/**
 * User Detail Page
 *
 * View a specific user's visits and progress.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

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

  // Get the target user's profile
  const { data: targetProfile, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (error || !targetProfile) {
    notFound()
  }

  // Get total facility count
  const { count: totalFacilities } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })

  // Get user's completion count
  const { count: facilitiesVisited } = await supabase
    .from('facility_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  // Get user's total visits
  const { count: totalVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)

  // Get user's recent visits with facility info
  const { data: recentVisits } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
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
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            {targetProfile.full_name}
          </h2>

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
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visits by Type */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Visits by Type</h3>
            {visitsByType.length > 0 ? (
              <div className="space-y-3">
                {visitsByType.map(({ type, count }) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-600">{type}</span>
                    <span className="font-medium text-slate-800">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No visits yet</p>
            )}
          </div>

          {/* Recent Visits */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recent Visits</h3>
            </div>
            {recentVisits && recentVisits.length > 0 ? (
              <ul className="divide-y divide-slate-100 max-h-96 overflow-auto">
                {recentVisits.map((visit) => {
                  const facility = visit.facilities as unknown as {
                    facility_name: string
                    type: string
                    city: string | null
                    state: string | null
                  }
                  return (
                    <li key={visit.id} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">
                            {facility?.facility_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {facility?.type}
                            {facility?.city && ` • ${facility.city}, ${facility.state}`}
                          </p>
                        </div>
                        <span className="text-sm text-slate-400">
                          {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center text-slate-500">
                No visits recorded yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

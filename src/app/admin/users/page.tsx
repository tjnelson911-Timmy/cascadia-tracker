/**
 * Admin Users Page
 *
 * View all users and their progress.
 * Includes leaderboard ranking.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get total facility count
  const { count: totalFacilities } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name')

  // Get completion counts for each user
  const { data: completions } = await supabase
    .from('facility_completions')
    .select('user_id')

  // Get visit counts for each user
  const { data: visits } = await supabase
    .from('visits')
    .select('user_id')

  // Calculate stats for each user
  const userStats = (profiles || []).map(profile => {
    const facilitiesVisited = completions?.filter(c => c.user_id === profile.id).length || 0
    const totalVisits = visits?.filter(v => v.user_id === profile.id).length || 0
    const completionPercentage = totalFacilities
      ? Math.round((facilitiesVisited / totalFacilities) * 100)
      : 0

    return {
      ...profile,
      facilitiesVisited,
      totalVisits,
      completionPercentage,
    }
  }).sort((a, b) => b.facilitiesVisited - a.facilitiesVisited)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cascadia</h1>
            <p className="text-sm text-slate-500">Leadership Presence Tracker</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Team Progress</h2>
          <p className="text-slate-500">
            {totalFacilities} total facilities • {profiles?.length || 0} team members
          </p>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Team Leaderboard</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {userStats.map((userStat, index) => (
              <Link
                key={userStat.id}
                href={`/admin/users/${userStat.id}`}
                className="block px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md' :
                    index === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {userStat.full_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {userStat.totalVisits} total visit{userStat.totalVisits !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {userStat.facilitiesVisited} <span className="font-normal text-slate-400">/ {totalFacilities}</span>
                    </p>
                    <p className={`text-sm font-medium ${
                      userStat.completionPercentage >= 75 ? 'text-emerald-600' :
                      userStat.completionPercentage >= 50 ? 'text-blue-600' :
                      userStat.completionPercentage >= 25 ? 'text-amber-600' :
                      'text-slate-500'
                    }`}>
                      {userStat.completionPercentage}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-32 hidden sm:block">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          userStat.completionPercentage >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                          userStat.completionPercentage >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          userStat.completionPercentage >= 25 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                          'bg-slate-400'
                        }`}
                        style={{ width: `${userStat.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

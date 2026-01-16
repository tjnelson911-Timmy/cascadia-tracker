'use client'

/**
 * Dashboard Client Component
 *
 * Client-side wrapper for the dashboard that manages filter state
 * and applies filters to all dashboard sections.
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import DashboardFilters from './dashboard-filters'
import PhotoThumbnail from './photo-thumbnail'
import ProgressChart from './charts/progress-chart'
import TypeBreakdownChart from './charts/type-breakdown-chart'
import MonthlyActivityChart from './charts/monthly-activity-chart'
import { DashboardFacilityMap, DashboardTimelinePlayer } from './dashboard-maps'

interface Facility {
  id: string
  facility_name: string
  type: string
  address: string | null
  city: string | null
  state: string | null
  county: string | null
  company: string | null
  team: string | null
  latitude: number | null
  longitude: number | null
  visited: boolean
  visit_date: string | null
}

interface Visit {
  id: string
  visit_date: string
  note: string | null
  signedPhotoUrl: string | null
  facility_id: string
  facilities: {
    facility_name: string
    type: string
    company: string | null
    team: string | null
  } | null
}

interface TimelineVisit {
  id: string
  visit_date: string
  facility_name: string
  type: string
  latitude: number | null
  longitude: number | null
  company: string | null
  team: string | null
}

interface ProgressData {
  date: string
  cumulative: number
}

interface DashboardClientProps {
  userName: string
  facilities: Facility[]
  recentVisits: Visit[]
  timelineVisits: TimelineVisit[]
  filterOptions: {
    companies: string[]
    teams: string[]
    types: string[]
  }
}

export default function DashboardClient({
  userName,
  facilities,
  recentVisits,
  timelineVisits,
  filterOptions,
}: DashboardClientProps) {
  // Filter state
  const [companyFilter, setCompanyFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (companyFilter && f.company !== companyFilter) return false
      if (teamFilter && f.team !== teamFilter) return false
      if (typeFilter && f.type !== typeFilter) return false
      return true
    })
  }, [facilities, companyFilter, teamFilter, typeFilter])

  // Filter recent visits
  const filteredRecentVisits = useMemo(() => {
    return recentVisits.filter(v => {
      if (companyFilter && v.facilities?.company !== companyFilter) return false
      if (teamFilter && v.facilities?.team !== teamFilter) return false
      if (typeFilter && v.facilities?.type !== typeFilter) return false
      return true
    }).slice(0, 5)
  }, [recentVisits, companyFilter, teamFilter, typeFilter])

  // Filter timeline visits
  const filteredTimelineVisits = useMemo(() => {
    return timelineVisits.filter(v => {
      if (companyFilter && v.company !== companyFilter) return false
      if (teamFilter && v.team !== teamFilter) return false
      if (typeFilter && v.type !== typeFilter) return false
      return true
    })
  }, [timelineVisits, companyFilter, teamFilter, typeFilter])

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const totalFacilities = filteredFacilities.length
    const visitedFacilities = filteredFacilities.filter(f => f.visited).length
    const totalVisits = filteredRecentVisits.length // This should be total visits count
    const completionPercentage = totalFacilities > 0
      ? Math.round((visitedFacilities / totalFacilities) * 100)
      : 0

    return {
      totalFacilities,
      visitedFacilities,
      totalVisits,
      completionPercentage,
    }
  }, [filteredFacilities, filteredRecentVisits])

  // Calculate chart data from filtered facilities
  const chartData = useMemo(() => {
    // Progress data - cumulative visits over time
    const visitDates = filteredFacilities
      .filter(f => f.visited && f.visit_date)
      .map(f => f.visit_date!)
      .sort()

    const progressData: ProgressData[] = []
    visitDates.forEach((date, index) => {
      progressData.push({ date, cumulative: index + 1 })
    })

    // Type breakdown
    const typeCountMap = new Map<string, number>()
    filteredFacilities.filter(f => f.visited).forEach(f => {
      const type = f.type || 'Other'
      typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1)
    })
    const visitsByType = Array.from(typeCountMap.entries())
      .map(([facility_type, visit_count]) => ({ facility_type, visit_count }))

    // Monthly activity
    const monthlyMap = new Map<string, number>()
    visitDates.forEach(date => {
      const month = date.substring(0, 7)
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1)
    })
    const monthlyVisits = Array.from(monthlyMap.entries())
      .map(([month, visit_count]) => ({ month, visit_count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return { progressData, visitsByType, monthlyVisits }
  }, [filteredFacilities])

  const hasFilters = companyFilter || teamFilter || typeFilter

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Action Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {userName}!
            </h2>
            <p className="text-blue-100 text-lg">
              {stats.completionPercentage < 100
                ? `You're ${stats.completionPercentage}% complete. Keep going!`
                : 'Amazing! You\'ve visited all facilities!'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Record Visit
            </Link>
            <Link
              href="/admin/add-facility"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 transition-all border border-white/30"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Add Facility
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        companies={filterOptions.companies}
        teams={filterOptions.teams}
        types={filterOptions.types}
        selectedCompany={companyFilter}
        selectedTeam={teamFilter}
        selectedType={typeFilter}
        onCompanyChange={setCompanyFilter}
        onTeamChange={setTeamFilter}
        onTypeChange={setTypeFilter}
        totalCount={facilities.length}
        filteredCount={filteredFacilities.length}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {hasFilters ? 'Filtered Facilities' : 'Total Facilities'}
              </h3>
              <p className="text-4xl font-bold text-slate-800 mt-2">
                {stats.totalFacilities}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {hasFilters ? 'Matching filters' : 'In the system'}
              </p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Facilities Visited
              </h3>
              <p className="text-4xl font-bold text-emerald-600 mt-2">
                {stats.visitedFacilities}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {hasFilters ? 'In filtered set' : 'Unique facilities'}
              </p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Completion
              </h3>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {stats.completionPercentage}%
              </p>
              <div className="mt-3 w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center ml-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Map */}
      <DashboardFacilityMap facilities={filteredFacilities} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ProgressChart data={chartData.progressData} totalFacilities={stats.totalFacilities} />
        <TypeBreakdownChart data={chartData.visitsByType} />
        <MonthlyActivityChart data={chartData.monthlyVisits} />
      </div>

      {/* Timeline Player */}
      <DashboardTimelinePlayer visits={filteredTimelineVisits} />

      {/* Recent Visits */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Recent Visits</h3>
          <Link
            href="/visits"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
          </Link>
        </div>
        {filteredRecentVisits.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {filteredRecentVisits.map((visit) => {
              const facility = visit.facilities
              return (
                <li key={visit.id} className="hover:bg-slate-50 transition-colors">
                  <Link href={`/visits/${visit.id}`} className="block px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {visit.signedPhotoUrl ? (
                        <PhotoThumbnail
                          src={visit.signedPhotoUrl}
                          alt={`Visit to ${facility?.facility_name || 'facility'}`}
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
                          {facility?.facility_name}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {facility?.type}
                          <span className="sm:hidden"> · {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-sm font-medium text-slate-600">
                          {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <svg className="w-5 h-5 text-slate-300 flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-500 mb-2">
              {hasFilters ? 'No visits match your filters' : 'No visits recorded yet.'}
            </p>
            {hasFilters ? (
              <button
                onClick={() => {
                  setCompanyFilter('')
                  setTeamFilter('')
                  setTypeFilter('')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            ) : (
              <Link href="/upload" className="text-blue-600 hover:text-blue-700 font-medium">
                Record your first visit
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

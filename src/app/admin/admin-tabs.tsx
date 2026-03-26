'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Facility {
  id: string
  facility_name: string
  type: string | null
  address: string | null
  city: string | null
  state: string | null
  county: string | null
  company: string | null
  team: string | null
}

interface AdminTabsProps {
  facilities: Facility[]
  userCount: number
  facilityCount: number
  visitCount: number
}

export default function AdminTabs({ facilities, userCount, facilityCount, visitCount }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'facilities'>('admin')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')

  const types = useMemo(() =>
    [...new Set(facilities.map(f => f.type).filter((t): t is string => !!t))].sort(),
    [facilities]
  )
  const companies = useMemo(() =>
    [...new Set(facilities.map(f => f.company).filter((c): c is string => !!c))].sort(),
    [facilities]
  )
  const teams = useMemo(() =>
    [...new Set(facilities.map(f => f.team).filter((t): t is string => !!t))].sort(),
    [facilities]
  )

  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (typeFilter && f.type !== typeFilter) return false
      if (companyFilter && f.company !== companyFilter) return false
      if (teamFilter && f.team !== teamFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const match =
          f.facility_name?.toLowerCase().includes(q) ||
          f.city?.toLowerCase().includes(q) ||
          f.county?.toLowerCase().includes(q) ||
          f.address?.toLowerCase().includes(q) ||
          f.company?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [facilities, search, typeFilter, companyFilter, teamFilter])

  const hasFilters = search || typeFilter || companyFilter || teamFilter

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{userCount}</p>
          <p className="text-xs sm:text-sm text-slate-500">Team Members</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{facilityCount}</p>
          <p className="text-xs sm:text-sm text-slate-500">Facilities</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-slate-800">{visitCount}</p>
          <p className="text-xs sm:text-sm text-slate-500">Total Visits</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-md p-1">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'admin'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Admin Functions
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'facilities'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Facilities ({facilityCount})
        </button>
      </div>

      {/* Admin Functions Tab */}
      {activeTab === 'admin' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Admin Functions</h2>
          </div>

          <div className="divide-y divide-slate-100">
            <Link
              href="/admin/all-visits"
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">View All Visits</p>
                <p className="text-sm text-slate-500">See all visits from all team members</p>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/add-user"
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 bg-cascadia-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cascadia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Add New User</p>
                <p className="text-sm text-slate-500">Create a new team member account</p>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Manage Users</p>
                <p className="text-sm text-slate-500">View all users and reset passwords</p>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/add-facility"
              className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">Add New Facility</p>
                <p className="text-sm text-slate-500">Add a facility to track visits</p>
              </div>
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search facilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cascadia-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cascadia-500"
              >
                <option value="">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={companyFilter}
                onChange={e => setCompanyFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cascadia-500"
              >
                <option value="">All Companies</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cascadia-500"
              >
                <option value="">All Teams</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setTypeFilter(''); setCompanyFilter(''); setTeamFilter('') }}
                  className="px-3 py-1.5 text-sm text-cascadia-600 hover:text-cascadia-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Showing {filteredFacilities.length} of {facilities.length} facilities
            </p>
          </div>

          {/* Facilities List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredFacilities.map(facility => (
                <div key={facility.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
                        {facility.facility_name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">
                        {[facility.address, facility.city, facility.state].filter(Boolean).join(', ')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {facility.type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {facility.type}
                          </span>
                        )}
                        {facility.company && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {facility.company}
                          </span>
                        )}
                        {facility.team && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                            {facility.team}
                          </span>
                        )}
                        {facility.county && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            {facility.county}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredFacilities.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-slate-500">No facilities match your search.</p>
                  {hasFilters && (
                    <button
                      onClick={() => { setSearch(''); setTypeFilter(''); setCompanyFilter(''); setTeamFilter('') }}
                      className="mt-2 text-cascadia-600 hover:text-cascadia-700 font-medium text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

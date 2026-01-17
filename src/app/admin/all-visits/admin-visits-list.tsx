'use client'

/**
 * Admin Visits List Component
 *
 * Filterable list of all visits from all users.
 * Shows user name for each visit.
 */

import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'

interface Facility {
  id: string
  facility_name: string
  type: string
  address: string | null
  city: string | null
  state: string | null
}

interface Visit {
  id: string
  visit_date: string
  note: string | null
  photo_url: string | null
  signedPhotoUrl?: string | null
  created_at: string
  user_name: string
  facilities: Facility | Facility[]
}

interface AdminVisitsListProps {
  visits: Visit[]
  facilityTypes: string[]
  userNames: string[]
}

export default function AdminVisitsList({ visits, facilityTypes, userNames }: AdminVisitsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter visits
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      const facility = visit.facilities as Facility

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = facility?.facility_name?.toLowerCase().includes(query)
        const matchesCity = facility?.city?.toLowerCase().includes(query)
        const matchesNote = visit.note?.toLowerCase().includes(query)
        const matchesUser = visit.user_name?.toLowerCase().includes(query)
        if (!matchesName && !matchesCity && !matchesNote && !matchesUser) return false
      }

      // Type filter
      if (typeFilter && facility?.type !== typeFilter) return false

      // User filter
      if (userFilter && visit.user_name !== userFilter) return false

      // Date range filter
      if (dateFrom && visit.visit_date < dateFrom) return false
      if (dateTo && visit.visit_date > dateTo) return false

      return true
    })
  }, [visits, searchQuery, typeFilter, userFilter, dateFrom, dateTo])

  // Export to CSV
  const exportToCSV = () => {
    const data = filteredVisits.map(visit => {
      const facility = visit.facilities as Facility
      return {
        'Date': visit.visit_date,
        'Team Member': visit.user_name,
        'Facility': facility?.facility_name || '',
        'Type': facility?.type || '',
        'Address': facility?.address || '',
        'City': facility?.city || '',
        'State': facility?.state || '',
        'Note': visit.note || '',
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `all-visits-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredVisits.map(visit => {
      const facility = visit.facilities as Facility
      return {
        'Date': visit.visit_date,
        'Team Member': visit.user_name,
        'Facility': facility?.facility_name || '',
        'Type': facility?.type || '',
        'Address': facility?.address || '',
        'City': facility?.city || '',
        'State': facility?.state || '',
        'Note': visit.note || '',
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'All Visits')
    XLSX.writeFile(wb, `all-visits-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('')
    setUserFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = searchQuery || typeFilter || userFilter || dateFrom || dateTo

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search facilities, notes, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {userNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredVisits.length}</span> of {visits.length} visits
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filteredVisits.map((visit) => {
              const facility = visit.facilities as Facility
              return (
                <li key={visit.id} className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Photo Thumbnail */}
                    {visit.signedPhotoUrl ? (
                      <img
                        src={visit.signedPhotoUrl}
                        alt=""
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Visit Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
                        {facility?.facility_name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        <span className="font-medium text-blue-600">{visit.user_name}</span>
                        <span className="mx-1">·</span>
                        {facility?.type}
                        <span className="hidden sm:inline">{facility?.city && ` · ${facility.city}, ${facility.state}`}</span>
                      </p>
                    </div>

                    {/* Date */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-slate-800 text-sm sm:text-base">
                        {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {hasFilters ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              )}
            </svg>
          </div>
          <p className="text-slate-600 font-medium mb-1">
            {hasFilters ? 'No visits match your filters' : 'No visits recorded yet'}
          </p>
          <p className="text-sm text-slate-400">
            {hasFilters ? 'Try adjusting your search criteria' : 'Team members have not recorded any visits yet'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

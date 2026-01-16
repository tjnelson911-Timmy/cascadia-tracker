'use client'

/**
 * Dashboard Filters Component
 *
 * Filter controls for company, team, and facility type.
 */

interface DashboardFiltersProps {
  companies: string[]
  teams: string[]
  types: string[]
  selectedCompany: string
  selectedTeam: string
  selectedType: string
  onCompanyChange: (value: string) => void
  onTeamChange: (value: string) => void
  onTypeChange: (value: string) => void
  totalCount: number
  filteredCount: number
}

export default function DashboardFilters({
  companies,
  teams,
  types,
  selectedCompany,
  selectedTeam,
  selectedType,
  onCompanyChange,
  onTeamChange,
  onTypeChange,
  totalCount,
  filteredCount,
}: DashboardFiltersProps) {
  const hasFilters = selectedCompany || selectedTeam || selectedType

  const clearFilters = () => {
    onCompanyChange('')
    onTeamChange('')
    onTypeChange('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">Filter Dashboard</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Company Filter */}
          {companies.length > 0 && (
            <select
              value={selectedCompany}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          )}

          {/* Team Filter */}
          {teams.length > 0 && (
            <select
              value={selectedTeam}
              onChange={(e) => onTeamChange(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          )}

          {/* Type Filter */}
          {types.length > 0 && (
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredCount}</span> of {totalCount}
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

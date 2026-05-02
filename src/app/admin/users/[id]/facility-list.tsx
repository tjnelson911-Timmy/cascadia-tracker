'use client'

import { useState } from 'react'
import DeleteVisitButton from './delete-visit-button'

interface Facility {
  id: string
  facility_name: string
  type: string
  city: string | null
  state: string | null
  visited: boolean
}

interface RecentVisit {
  id: string
  visit_date: string
  signedPhotoUrl: string | null
  facility_name: string
  type: string
  city: string | null
  state: string | null
}

interface VisitByType {
  type: string
  count: number
}

export default function FacilityList({
  facilities,
  recentVisits,
  visitsByType,
}: {
  facilities: Facility[]
  recentVisits: RecentVisit[]
  visitsByType: VisitByType[]
}) {
  const [view, setView] = useState<'visited' | 'not-visited'>('visited')

  const visited = facilities.filter(f => f.visited)
  const notVisited = facilities.filter(f => !f.visited)
  const displayed = view === 'visited' ? visited : notVisited

  return (
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

      {/* Facilities with toggle */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Facilities</h3>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('visited')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'visited'
                  ? 'bg-white text-cascadia-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Visited ({visited.length})
            </button>
            <button
              onClick={() => setView('not-visited')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'not-visited'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Not Visited ({notVisited.length})
            </button>
          </div>
        </div>

        {view === 'visited' ? (
          // Show recent visits with photos and delete buttons
          recentVisits.length > 0 ? (
            <ul className="divide-y divide-slate-100 max-h-[32rem] overflow-auto">
              {recentVisits.map((visit) => (
                <li key={visit.id} className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    {visit.signedPhotoUrl ? (
                      <img
                        src={visit.signedPhotoUrl}
                        alt={visit.facility_name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800">{visit.facility_name}</p>
                      <p className="text-sm text-slate-500">
                        {visit.type}
                        {visit.city && ` • ${visit.city}, ${visit.state}`}
                      </p>
                    </div>
                    <span className="text-sm text-slate-400 shrink-0">
                      {new Date(visit.visit_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <DeleteVisitButton visitId={visit.id} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500">
              No visits recorded yet.
            </div>
          )
        ) : (
          // Show not-visited facilities
          displayed.length > 0 ? (
            <ul className="divide-y divide-slate-100 max-h-[32rem] overflow-auto">
              {displayed.map((facility) => (
                <li key={facility.id} className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800">{facility.facility_name}</p>
                      <p className="text-sm text-slate-500">
                        {facility.type}
                        {facility.city && ` • ${facility.city}, ${facility.state}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500">
              All facilities visited!
            </div>
          )
        )}
      </div>
    </div>
  )
}

'use client'

/**
 * Dashboard Maps Wrapper
 *
 * Client component that wraps map components with dynamic imports
 * to avoid SSR issues with Mapbox GL.
 */

import dynamic from 'next/dynamic'

// Dynamic import for FacilityMap to avoid SSR issues with Mapbox GL
const FacilityMap = dynamic(() => import('./facility-map'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="h-[450px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading map...</div>
      </div>
    </div>
  ),
})

// Dynamic import for TimelinePlayer to avoid SSR issues with Mapbox GL
const TimelinePlayer = dynamic(() => import('./timeline-player'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading timeline...</div>
      </div>
    </div>
  ),
})

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

interface TimelineVisit {
  id: string
  visit_date: string
  facility_name: string
  type: string
  latitude: number | null
  longitude: number | null
}

interface DashboardMapsProps {
  facilities: Facility[]
  timelineVisits: TimelineVisit[]
}

export function DashboardFacilityMap({ facilities }: { facilities: Facility[] }) {
  return <FacilityMap facilities={facilities} />
}

export function DashboardTimelinePlayer({ visits }: { visits: TimelineVisit[] }) {
  return <TimelinePlayer visits={visits} />
}

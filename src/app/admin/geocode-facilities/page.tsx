/**
 * Geocode Facilities Page
 *
 * Admin page to geocode facility addresses into coordinates.
 * Required for map functionality.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GeocodeForm from './geocode-form'

export default async function GeocodeFacilitiesPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get facilities missing coordinates
  const { data: facilitiesNeedingGeocode, count: missingCount } = await supabase
    .from('facilities')
    .select('id, facility_name, address, city, state, zip', { count: 'exact' })
    .or('latitude.is.null,longitude.is.null')
    .order('facility_name')

  // Get total facility count
  const { count: totalCount } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })

  const geocodedCount = (totalCount ?? 0) - (missingCount ?? 0)

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
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Geocode Facilities
          </h2>
          <p className="text-slate-500 mb-6">
            Convert facility addresses to map coordinates for the map view.
          </p>

          {/* Status */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{geocodedCount}</span> of{' '}
                  <span className="font-semibold text-slate-800">{totalCount ?? 0}</span> facilities geocoded
                </p>
                {missingCount && missingCount > 0 ? (
                  <p className="text-sm text-amber-600 mt-1">
                    {missingCount} facilities need coordinates
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    All facilities have coordinates!
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${totalCount ? (geocodedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Geocode Form */}
          {facilitiesNeedingGeocode && facilitiesNeedingGeocode.length > 0 ? (
            <GeocodeForm facilities={facilitiesNeedingGeocode} />
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">All Done!</h3>
              <p className="text-slate-500 mb-4">All facilities have been geocoded.</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

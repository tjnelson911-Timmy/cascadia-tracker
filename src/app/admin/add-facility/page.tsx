/**
 * Add Facility Page
 *
 * Form to add a single new facility with auto-geocoding.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddFacilityForm from './add-facility-form'

export default async function AddFacilityPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get existing facility types for dropdown
  const { data: facilities } = await supabase
    .from('facilities')
    .select('type')

  const facilityTypes = [...new Set(
    facilities?.map(f => f.type).filter(Boolean)
  )].sort()

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
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Add New Facility
          </h2>
          <p className="text-slate-500 mb-6">
            Add a facility to track visits. Map coordinates will be added automatically.
          </p>

          <AddFacilityForm facilityTypes={facilityTypes} />
        </div>
      </main>
    </div>
  )
}

/**
 * Facility Import Page
 *
 * WHY THIS FILE?
 * Allows importing facilities from a CSV file.
 * CSV format expected:
 * name,address,facility_type,latitude,longitude
 *
 * Facility types must be: SNF, AL, IL, or Hospice
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ImportForm from './import-form'
import Link from 'next/link'

export default async function ImportFacilitiesPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current facility count
  const { count: facilityCount } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })

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
            Import Facilities
          </h2>
          <p className="text-slate-500 mb-6">
            Upload an Excel or CSV file with your facility data. Current count: {facilityCount ?? 0} facilities.
          </p>

          {/* File Format Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-700 mb-2">Expected Columns:</h3>
            <p className="text-sm text-slate-600">
              Facility Name, Type, Address, City, State, Zip, County, Company, Team
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Accepts .xlsx, .xls, or .csv files. First row should be headers.
            </p>
          </div>

          <ImportForm />
        </div>
      </main>
    </div>
  )
}

/**
 * Visit Upload Page
 *
 * WHY THIS FILE?
 * This page allows users to record a facility visit by:
 * - Selecting a facility from the dropdown
 * - Uploading a photo as proof
 * - Optionally setting a different date
 * - Adding an optional note
 *
 * PROTECTED: Only accessible when logged in
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UploadForm from './upload-form'
import Link from 'next/link'

export default async function UploadPage() {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if they need to change password
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, must_change_password')
    .eq('id', user.id)
    .single()

  if (profile?.must_change_password) {
    redirect('/change-password')
  }

  // Fetch all facilities for the dropdown using RPC function
  const { data: facilities, error } = await supabase
    .rpc('get_all_facilities')

  if (error) {
    console.error('Error fetching facilities:', error)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Cascadia</h1>
            <p className="text-sm text-slate-500">Leadership Presence Tracker</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">{profile?.full_name}</span>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Record a Visit
          </h2>
          <p className="text-slate-500 mb-6">
            Upload a photo to document your facility visit.
          </p>

          {facilities && facilities.length > 0 ? (
            <UploadForm
              facilities={facilities}
              userId={user.id}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                No facilities have been imported yet.
              </p>
              <Link
                href="/admin/import-facilities"
                className="inline-flex items-center gap-2 bg-cascadia-600 hover:bg-cascadia-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Import Facilities
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

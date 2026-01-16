/**
 * Visit Detail Page
 *
 * View, edit, or delete a single visit.
 */

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EditForm from './edit-form'
import DeleteButton from './delete-button'

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the visit
  const { data: visit, error } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      note,
      photo_url,
      facility_id,
      user_id,
      created_at,
      facilities (
        id,
        facility_name,
        type,
        address,
        city,
        state
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !visit) {
    notFound()
  }

  // Get signed URL for photo
  let signedPhotoUrl = null
  if (visit.photo_url) {
    const { data } = await supabase.storage
      .from('visit-photos')
      .createSignedUrl(visit.photo_url, 3600)
    signedPhotoUrl = data?.signedUrl
  }

  const facility = visit.facilities as unknown as {
    id: string
    facility_name: string
    type: string
    address: string | null
    city: string | null
    state: string | null
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
          <Link
            href="/visits"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ← Back to Visits
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Photo */}
          {signedPhotoUrl && (
            <div className="aspect-video bg-slate-100">
              <img
                src={signedPhotoUrl}
                alt={`Visit to ${facility?.facility_name}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Facility Info */}
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">
              {facility?.facility_name}
            </h2>
            <p className="text-slate-500">
              {facility?.type}
              {facility?.city && ` • ${facility.city}, ${facility.state}`}
            </p>
            {facility?.address && (
              <p className="text-sm text-slate-400 mt-1">
                {facility.address}
              </p>
            )}
          </div>

          {/* Edit Form */}
          <div className="p-6">
            <EditForm
              visitId={visit.id}
              initialDate={visit.visit_date}
              initialNote={visit.note || ''}
            />
          </div>

          {/* Delete Section */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <DeleteButton
              visitId={visit.id}
              facilityId={visit.facility_id}
              facilityName={facility?.facility_name || 'this facility'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

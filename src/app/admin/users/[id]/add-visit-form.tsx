'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Facility {
  id: string
  facility_name: string
  type: string
}

export default function AddVisitForm({
  userId,
  facilities,
}: {
  userId: string
  facilities: Facility[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [facilityId, setFacilityId] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!facilityId) {
      setError('Select a facility')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('facilityId', facilityId)
      formData.append('visitDate', visitDate)
      if (note) formData.append('note', note)
      if (photo) formData.append('photo', photo)

      const res = await fetch('/api/admin/add-visit', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to add visit')
        return
      }

      // Reset form
      setFacilityId('')
      setVisitDate(new Date().toISOString().split('T')[0])
      setNote('')
      setPhoto(null)
      setOpen(false)
      router.refresh()
    } catch {
      setError('Failed to add visit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm font-medium bg-cascadia-600 hover:bg-cascadia-700 text-white rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Visit
      </button>
    )
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-cascadia-500 focus:border-transparent transition-all"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Add Visit</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Facility</label>
          <select
            value={facilityId}
            onChange={e => setFacilityId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select facility...</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.facility_name} ({f.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
          <input
            type="date"
            value={visitDate}
            onChange={e => setVisitDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Photo (optional)</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:border-cascadia-400 hover:text-cascadia-600 transition-colors text-left"
          >
            {photo ? photo.name : 'Choose photo...'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => setPhoto(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note..."
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2 bg-cascadia-600 hover:bg-cascadia-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Visit'}
      </button>
    </form>
  )
}

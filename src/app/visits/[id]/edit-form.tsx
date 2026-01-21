'use client'

/**
 * Edit Visit Form
 *
 * Allows editing visit date and note.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface EditFormProps {
  visitId: string
  initialDate: string
  initialNote: string
}

export default function EditForm({ visitId, initialDate, initialNote }: EditFormProps) {
  const router = useRouter()
  const [visitDate, setVisitDate] = useState(initialDate)
  const [note, setNote] = useState(initialNote)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasChanges = visitDate !== initialDate || note !== initialNote

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('visits')
        .update({
          visit_date: visitDate,
          note: note || null,
        })
        .eq('id', visitId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update visit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-slate-800">Edit Visit</h3>

      {/* Visit Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Visit Date
        </label>
        <input
          id="date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cascadia-500 focus:border-transparent"
          required
        />
      </div>

      {/* Note */}
      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Note <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about your visit..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-cascadia-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
          Visit updated successfully!
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!hasChanges || isLoading}
        className="w-full bg-cascadia-600 hover:bg-cascadia-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

'use client'

/**
 * Delete Visit Button
 *
 * Deletes a visit with confirmation.
 * Handles cascading updates to facility_completions.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeleteButtonProps {
  visitId: string
  facilityId: string
  facilityName: string
}

export default function DeleteButton({ visitId, facilityId, facilityName }: DeleteButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const supabase = createClient()

      // Check if this visit is the first_visit_id in facility_completions
      const { data: completion } = await supabase
        .from('facility_completions')
        .select('id')
        .eq('first_visit_id', visitId)
        .single()

      if (completion) {
        // Find the next earliest visit for this facility by this user
        const { data: { user } } = await supabase.auth.getUser()

        const { data: otherVisits } = await supabase
          .from('visits')
          .select('id, visit_date')
          .eq('facility_id', facilityId)
          .eq('user_id', user?.id)
          .neq('id', visitId)
          .order('visit_date', { ascending: true })
          .limit(1)

        if (otherVisits && otherVisits.length > 0) {
          // Update completion to point to next visit
          await supabase
            .from('facility_completions')
            .update({ first_visit_id: otherVisits[0].id })
            .eq('id', completion.id)
        } else {
          // No other visits, delete the completion record
          await supabase
            .from('facility_completions')
            .delete()
            .eq('id', completion.id)
        }
      }

      // Now delete the visit
      const { error: deleteError } = await supabase
        .from('visits')
        .delete()
        .eq('id', visitId)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Redirect to visits list
      router.push('/visits')
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete visit')
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this visit to <strong>{facilityName}</strong>?
          This cannot be undone.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 text-sm font-medium"
    >
      Delete this visit
    </button>
  )
}

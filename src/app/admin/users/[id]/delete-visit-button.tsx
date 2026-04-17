'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteVisitButton({ visitId }: { visitId: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this visit? This cannot be undone.')) return

    setDeleting(true)
    try {
      const res = await fetch('/api/admin/delete-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete visit')
        return
      }

      router.refresh()
    } catch {
      alert('Failed to delete visit')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
      title="Delete visit"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}

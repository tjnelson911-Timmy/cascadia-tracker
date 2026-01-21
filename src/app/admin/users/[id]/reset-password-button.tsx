'use client'

/**
 * Reset Password Button Component
 *
 * Allows admin to reset a user's password to the default.
 */

import { useState } from 'react'

interface ResetPasswordButtonProps {
  userId: string
  userName: string
}

export default function ResetPasswordButton({ userId, userName }: ResetPasswordButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleReset = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setResult({ success: true, message: `Password reset to default. ${userName} will be prompted to change it on next login.` })
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Failed to reset password' })
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="space-y-3">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Reset Password
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-3">
            Reset password for <strong>{userName}</strong> to the default? They will be required to change it on next login.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Yes, Reset'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`p-3 rounded-lg text-sm ${
          result.success
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  )
}

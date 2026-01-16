'use client'

/**
 * Login Form Component (Client)
 *
 * WHY THIS FILE?
 * This handles the interactive parts of the login form:
 * - User selection dropdown
 * - Password input
 * - Form submission
 * - Loading/error states
 *
 * WHY "use client"?
 * React needs to run in the browser for:
 * - Form state management (useState)
 * - Event handlers (onChange, onSubmit)
 * - Dynamic UI updates
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  full_name: string
}

interface LoginFormProps {
  users: User[]
}

export default function LoginForm({ users }: LoginFormProps) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Convert full name to email format: "Tim Nelson" -> "tim.nelson@cascadia.local"
  const getEmailFromName = (fullName: string): string => {
    return fullName.toLowerCase().replace(' ', '.') + '@cascadia.local'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Find the selected user
    const selectedUser = users.find(u => u.id === selectedUserId)
    if (!selectedUser) {
      setError('Please select your name')
      setIsLoading(false)
      return
    }

    // Get email from user name
    const email = getEmailFromName(selectedUser.full_name)

    try {
      const supabase = createClient()

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Provide user-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Incorrect password. Please try again.')
        } else {
          setError(signInError.message)
        }
        setIsLoading(false)
        return
      }

      // Successfully signed in - check if password change required
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('must_change_password')
          .eq('id', data.user.id)
          .single()

        if (profile?.must_change_password) {
          router.push('/change-password')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* User Dropdown */}
      <div>
        <label
          htmlFor="user"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Your Name
        </label>
        <select
          id="user"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        >
          <option value="">Select your name...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}

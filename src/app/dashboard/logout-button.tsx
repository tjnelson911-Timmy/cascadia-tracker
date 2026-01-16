'use client'

/**
 * Logout Button Component
 *
 * WHY THIS FILE?
 * A client component that handles signing the user out.
 * Uses Supabase's signOut method and redirects to login.
 */

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}

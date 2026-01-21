'use client'

/**
 * Navigation Header Component
 *
 * Shared header with navigation links and mobile menu.
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavHeaderProps {
  userName: string
  onLogout?: () => void
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/visits', label: 'All Visits' },
  { href: '/upload', label: 'Record Visit' },
  { href: '/admin/users', label: 'Team' },
]

export default function NavHeader({ userName, onLogout }: NavHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-3">
            <img src="/cascadia-large.png" alt="Cascadia" className="h-10" />
            <div>
              <h1 className="text-xl font-bold text-cascadia-700">Cascadia</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Leadership Presence Tracker</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-cascadia-50 text-cascadia-600'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-600">{userName}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'bg-cascadia-50 text-cascadia-600'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-100 px-4">
              <p className="text-sm text-slate-500 mb-2">{userName}</p>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

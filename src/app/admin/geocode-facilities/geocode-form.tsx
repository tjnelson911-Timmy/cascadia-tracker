'use client'

/**
 * Geocode Form Component
 *
 * Handles batch geocoding of facilities with progress indicator.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { geocodeAddress } from '@/lib/geocode'

interface Facility {
  id: string
  facility_name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
}

interface GeocodeFormProps {
  facilities: Facility[]
}

interface GeocodeResult {
  id: string
  name: string
  status: 'pending' | 'success' | 'failed'
  message?: string
}

export default function GeocodeForm({ facilities }: GeocodeFormProps) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleGeocode = async () => {
    setIsRunning(true)
    setError('')
    setResults([])
    setProgress(0)

    const supabase = createClient()
    const newResults: GeocodeResult[] = []

    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i]

      // Update progress
      setProgress(Math.round(((i + 1) / facilities.length) * 100))

      // Add pending result
      newResults.push({
        id: facility.id,
        name: facility.facility_name,
        status: 'pending',
      })
      setResults([...newResults])

      try {
        // Geocode the address
        const coords = await geocodeAddress(
          facility.address || '',
          facility.city,
          facility.state,
          facility.zip
        )

        if (coords) {
          // Update facility in database
          const { error: updateError } = await supabase
            .from('facilities')
            .update({
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
            .eq('id', facility.id)

          if (updateError) {
            newResults[i] = {
              ...newResults[i],
              status: 'failed',
              message: 'Database update failed',
            }
          } else {
            newResults[i] = {
              ...newResults[i],
              status: 'success',
              message: `${coords.confidence} confidence`,
            }
          }
        } else {
          newResults[i] = {
            ...newResults[i],
            status: 'failed',
            message: 'No coordinates found',
          }
        }
      } catch (err) {
        newResults[i] = {
          ...newResults[i],
          status: 'failed',
          message: err instanceof Error ? err.message : 'Unknown error',
        }
      }

      setResults([...newResults])

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setIsRunning(false)

    // Refresh the page after a short delay to show updated counts
    setTimeout(() => {
      router.refresh()
    }, 1500)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const failedCount = results.filter(r => r.status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Facilities Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b font-medium text-slate-700">
          Facilities to Geocode ({facilities.length})
        </div>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Address</th>
                <th className="text-left px-3 py-2">City</th>
                <th className="text-left px-3 py-2 w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {facilities.map((facility, i) => {
                const result = results[i]
                return (
                  <tr key={facility.id}>
                    <td className="px-3 py-2 font-medium">{facility.facility_name}</td>
                    <td className="px-3 py-2 text-slate-600">{facility.address || '-'}</td>
                    <td className="px-3 py-2 text-slate-600">{facility.city || '-'}</td>
                    <td className="px-3 py-2">
                      {result ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            result.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : result.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {result.status === 'success' && '✓'}
                          {result.status === 'failed' && '✗'}
                          {result.status === 'pending' && '...'}
                          {result.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Geocoding in progress...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.length > 0 && !isRunning && (
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            <span className="text-green-600 font-semibold">{successCount}</span> succeeded,{' '}
            <span className="text-red-600 font-semibold">{failedCount}</span> failed
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleGeocode}
        disabled={isRunning}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? (
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
            Geocoding...
          </span>
        ) : (
          `Geocode ${facilities.length} Facilities`
        )}
      </button>
    </div>
  )
}

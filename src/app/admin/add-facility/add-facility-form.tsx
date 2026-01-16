'use client'

/**
 * Add Facility Form Component
 *
 * Form for adding a single facility with auto-geocoding.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { geocodeAddress } from '@/lib/geocode'

interface AddFacilityFormProps {
  facilityTypes: string[]
}

export default function AddFacilityForm({ facilityTypes }: AddFacilityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    facility_name: '',
    type: '',
    customType: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    county: '',
    company: '',
    team: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Determine the type (custom or selected)
      const facilityType = formData.type === 'custom' ? formData.customType : formData.type

      // Insert facility
      const { data: facility, error: insertError } = await supabase
        .from('facilities')
        .insert({
          facility_name: formData.facility_name,
          type: facilityType,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          zip: formData.zip || null,
          county: formData.county || null,
          company: formData.company || null,
          team: formData.team || null,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Geocode the address
      if (formData.address || formData.city) {
        try {
          const coords = await geocodeAddress(
            formData.address,
            formData.city || null,
            formData.state || null,
            formData.zip || null
          )

          if (coords) {
            await supabase
              .from('facilities')
              .update({
                latitude: coords.latitude,
                longitude: coords.longitude,
              })
              .eq('id', facility.id)
          }
        } catch {
          // Geocoding failed, but facility was still added
          console.warn('Geocoding failed for new facility')
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add facility')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Facility Added!</h3>
        <p className="text-slate-500">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Facility Name */}
      <div>
        <label htmlFor="facility_name" className="block text-sm font-medium text-slate-700 mb-1">
          Facility Name *
        </label>
        <input
          type="text"
          id="facility_name"
          name="facility_name"
          required
          value={formData.facility_name}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Sunrise Senior Living"
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
          Facility Type *
        </label>
        <select
          id="type"
          name="type"
          required
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a type...</option>
          {facilityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
          <option value="custom">Other (custom)</option>
        </select>
      </div>

      {/* Custom Type */}
      {formData.type === 'custom' && (
        <div>
          <label htmlFor="customType" className="block text-sm font-medium text-slate-700 mb-1">
            Custom Type *
          </label>
          <input
            type="text"
            id="customType"
            name="customType"
            required
            value={formData.customType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Hospice"
          />
        </div>
      )}

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123 Main St"
        />
      </div>

      {/* City, State, Zip row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="col-span-1 sm:col-span-1">
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            maxLength={2}
            value={formData.state}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="WA"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="zip" className="block text-sm font-medium text-slate-700 mb-1">
            ZIP
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* County */}
      <div>
        <label htmlFor="county" className="block text-sm font-medium text-slate-700 mb-1">
          County
        </label>
        <input
          type="text"
          id="county"
          name="county"
          value={formData.county}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Company & Team row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="team" className="block text-sm font-medium text-slate-700 mb-1">
            Team
          </label>
          <input
            type="text"
            id="team"
            name="team"
            value={formData.team}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Adding Facility...
          </span>
        ) : (
          'Add Facility'
        )}
      </button>
    </form>
  )
}

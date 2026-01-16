'use client'

/**
 * Upload Form Component (Client)
 *
 * WHY THIS FILE?
 * Handles the visit upload form:
 * - Facility dropdown selection
 * - Photo file upload
 * - Date picker (defaults to today)
 * - Optional note textarea
 * - Submits to Supabase
 *
 * UPLOAD FLOW:
 * 1. User selects facility and photo
 * 2. Photo is uploaded to Supabase Storage
 * 3. Visit record is created in database
 * 4. If first visit to this facility, completion record is created
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Facility {
  id: string
  facility_name: string
  type: string
  address: string | null
  city: string | null
  state: string | null
}

interface UploadFormProps {
  facilities: Facility[]
  userId: string
}

export default function UploadForm({ facilities, userId }: UploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate inputs
    if (!selectedFacilityId) {
      setError('Please select a facility')
      setIsLoading(false)
      return
    }
    if (!selectedFile) {
      setError('Please upload a photo')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Step 1: Upload photo to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(fileName, selectedFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload photo: ' + uploadError.message)
        setIsLoading(false)
        return
      }

      // Step 2: Create visit record
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          user_id: userId,
          facility_id: selectedFacilityId,
          photo_url: fileName,
          visit_date: visitDate,
          note: note || null,
        })
        .select()
        .single()

      if (visitError) {
        console.error('Visit error:', visitError)
        setError('Failed to record visit: ' + visitError.message)
        setIsLoading(false)
        return
      }

      // Step 3: Check if this is the first visit to this facility
      const { data: existingCompletion } = await supabase
        .from('facility_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('facility_id', selectedFacilityId)
        .single()

      // If no existing completion, create one
      if (!existingCompletion) {
        const { error: completionError } = await supabase
          .from('facility_completions')
          .insert({
            user_id: userId,
            facility_id: selectedFacilityId,
            first_visit_id: visit.id,
          })

        if (completionError) {
          console.error('Completion error:', completionError)
          // Don't fail the whole operation for this
        }
      }

      // Success!
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  // Get selected facility details for display
  const selectedFacility = facilities.find(f => f.id === selectedFacilityId)

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Visit Recorded!</h3>
        <p className="text-slate-500">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Facility Selection */}
      <div>
        <label
          htmlFor="facility"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Facility
        </label>
        <select
          id="facility"
          value={selectedFacilityId}
          onChange={(e) => setSelectedFacilityId(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        >
          <option value="">Select a facility...</option>
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.facility_name} ({facility.type})
            </option>
          ))}
        </select>
        {selectedFacility && (
          <p className="text-sm text-slate-500 mt-1">
            {[selectedFacility.address, selectedFacility.city, selectedFacility.state].filter(Boolean).join(', ') || 'No address'}
          </p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Photo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            previewUrl
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }`}
        >
          {previewUrl ? (
            <div className="space-y-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <p className="text-sm text-slate-500">
                Click to change photo
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="w-12 h-12 mx-auto text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-slate-600 font-medium">
                Click to upload a photo
              </p>
              <p className="text-sm text-slate-400">
                JPG, PNG up to 10MB
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Visit Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Visit Date
        </label>
        <input
          id="date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        />
        <p className="text-sm text-slate-500 mt-1">
          Defaults to today. Change if recording a past visit.
        </p>
      </div>

      {/* Note (Optional) */}
      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Note <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any notes about your visit..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
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
            Uploading...
          </span>
        ) : (
          'Record Visit'
        )}
      </button>
    </form>
  )
}

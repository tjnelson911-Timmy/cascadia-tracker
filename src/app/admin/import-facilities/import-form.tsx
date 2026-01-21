'use client'

/**
 * Import Form - Handles Excel/CSV facility imports
 * Expected columns: Facility Name, Type, Address, City, State, Zip, County, Company, Team
 * Automatically geocodes facilities after import.
 */

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { geocodeAddress } from '@/lib/geocode'
import * as XLSX from 'xlsx'

interface FacilityRow {
  facility_name: string
  type: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  county: string | null
  company: string | null
  team: string | null
}

interface InsertedFacility extends FacilityRow {
  id: string
}

export default function ImportForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<FacilityRow[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  // Geocoding state
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeProgress, setGeocodeProgress] = useState(0)
  const [geocodeResults, setGeocodeResults] = useState({ success: 0, failed: 0 })

  // Parse Excel file
  const parseExcel = async (file: File): Promise<FacilityRow[]> => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]

    if (jsonData.length < 2) {
      throw new Error('File must have a header row and at least one data row')
    }

    const rows: FacilityRow[] = []
    const headers = jsonData[0].map(h => String(h || '').toLowerCase().trim())

    // Map column names (flexible matching)
    const findCol = (keywords: string[]) =>
      headers.findIndex(h => keywords.some(k => h.includes(k)))

    const cols = {
      name: findCol(['facility', 'name']),
      type: findCol(['type']),
      address: findCol(['address']),
      city: findCol(['city']),
      state: findCol(['state']),
      zip: findCol(['zip', 'postal']),
      county: findCol(['county']),
      company: findCol(['company']),
      team: findCol(['team']),
    }

    if (cols.name === -1) throw new Error('Missing "Facility Name" column')
    if (cols.type === -1) throw new Error('Missing "Type" column')

    // Parse data rows
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!row || !row[cols.name]) continue

      const getValue = (idx: number) => idx !== -1 && row[idx] ? String(row[idx]).trim() : null

      rows.push({
        facility_name: String(row[cols.name]).trim(),
        type: String(row[cols.type] || '').trim(),
        address: getValue(cols.address),
        city: getValue(cols.city),
        state: getValue(cols.state),
        zip: getValue(cols.zip),
        county: getValue(cols.county),
        company: getValue(cols.company),
        team: getValue(cols.team),
      })
    }

    return rows
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')
    setParsedData([])

    if (!file) return

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select an Excel (.xlsx, .xls) or CSV file')
      return
    }

    setSelectedFile(file)

    try {
      const data = await parseExcel(file)
      if (data.length === 0) {
        throw new Error('No valid data rows found')
      }
      setParsedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Insert facilities and get back the inserted records with IDs
      const { data: insertedFacilities, error: insertError } = await supabase
        .from('facilities')
        .insert(parsedData)
        .select()

      if (insertError) {
        throw new Error(insertError.message)
      }

      setImportedCount(parsedData.length)
      setSuccess(true)
      setIsLoading(false)

      // Start geocoding the newly inserted facilities
      if (insertedFacilities && insertedFacilities.length > 0) {
        await geocodeFacilities(insertedFacilities as InsertedFacility[])
      }

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setIsLoading(false)
    }
  }

  const geocodeFacilities = async (facilities: InsertedFacility[]) => {
    setIsGeocoding(true)
    setGeocodeProgress(0)
    setGeocodeResults({ success: 0, failed: 0 })

    const supabase = createClient()
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i]
      setGeocodeProgress(Math.round(((i + 1) / facilities.length) * 100))

      try {
        const coords = await geocodeAddress(
          facility.address || '',
          facility.city,
          facility.state,
          facility.zip
        )

        if (coords) {
          await supabase
            .from('facilities')
            .update({
              latitude: coords.latitude,
              longitude: coords.longitude,
            })
            .eq('id', facility.id)
          successCount++
        } else {
          failedCount++
        }
      } catch {
        failedCount++
      }

      setGeocodeResults({ success: successCount, failed: failedCount })

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150))
    }

    setIsGeocoding(false)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Import Complete!</h3>
        <p className="text-slate-500 mb-4">{importedCount} facilities imported.</p>

        {/* Geocoding Progress */}
        {isGeocoding && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-cascadia-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding map coordinates...
              </span>
              <span>{geocodeProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-cascadia-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${geocodeProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {geocodeResults.success} geocoded, {geocodeResults.failed} failed
            </p>
          </div>
        )}

        {/* Geocoding Complete */}
        {!isGeocoding && geocodeResults.success > 0 && (
          <div className="mt-4 bg-slate-50 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-sm text-slate-600">
              <span className="text-green-600 font-medium">{geocodeResults.success}</span> facilities geocoded for map
              {geocodeResults.failed > 0 && (
                <span className="text-slate-400"> ({geocodeResults.failed} could not be geocoded)</span>
              )}
            </p>
          </div>
        )}

        <p className="text-slate-400 text-sm mt-4">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          selectedFile ? 'border-cascadia-300 bg-cascadia-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {selectedFile ? (
          <div>
            <p className="font-medium text-slate-800">{selectedFile.name}</p>
            <p className="text-sm text-slate-500 mt-1">{parsedData.length} facilities found</p>
          </div>
        ) : (
          <div>
            <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="font-medium text-slate-600">Drop your Excel file here or click to browse</p>
            <p className="text-sm text-slate-400 mt-1">.xlsx, .xls, or .csv</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />

      {/* Preview */}
      {parsedData.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b font-medium text-slate-700">
            Preview ({parsedData.length} facilities)
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-left px-3 py-2">City</th>
                  <th className="text-left px-3 py-2">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.facility_name}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.city || '-'}</td>
                    <td className="px-3 py-2">{row.company || '-'}</td>
                  </tr>
                ))}
                {parsedData.length > 10 && (
                  <tr><td colSpan={4} className="px-3 py-2 text-slate-400 text-center">...and {parsedData.length - 10} more</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {parsedData.length > 0 && (
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="w-full bg-cascadia-600 hover:bg-cascadia-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Importing...' : `Import ${parsedData.length} Facilities`}
        </button>
      )}
    </div>
  )
}

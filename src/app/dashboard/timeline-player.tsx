'use client'

/**
 * Timeline Player Component
 *
 * Animated map showing visits appearing chronologically.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Visit {
  id: string
  facility_name: string
  type: string
  latitude: number | null
  longitude: number | null
  visit_date: string
}

interface TimelinePlayerProps {
  visits: Visit[]
}

export default function TimelinePlayer({ visits }: TimelinePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(1)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Sort visits by date and filter those with coordinates
  const sortedVisits = useMemo(() => {
    return visits
      .filter(v => v.latitude && v.longitude)
      .sort((a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime())
  }, [visits])

  // Visible visits (up to current index)
  const visibleVisits = useMemo(() => {
    return sortedVisits.slice(0, currentIndex + 1)
  }, [sortedVisits, currentIndex])

  // Current visit for highlighting
  const currentVisit = sortedVisits[currentIndex]

  // Calculate initial view state
  const initialViewState = useMemo(() => {
    if (sortedVisits.length === 0) {
      return { latitude: 47.5, longitude: -122.0, zoom: 7 }
    }

    let sumLat = 0, sumLng = 0
    sortedVisits.forEach(v => {
      sumLat += v.latitude!
      sumLng += v.longitude!
    })

    return {
      latitude: sumLat / sortedVisits.length,
      longitude: sumLng / sortedVisits.length,
      zoom: 6,
    }
  }, [sortedVisits])

  // Animation effect
  useEffect(() => {
    if (!isPlaying || currentIndex >= sortedVisits.length - 1) {
      if (currentIndex >= sortedVisits.length - 1) {
        setIsPlaying(false)
      }
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= sortedVisits.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, sortedVisits.length, speed])

  const handlePlayPause = useCallback(() => {
    if (currentIndex >= sortedVisits.length - 1) {
      // Reset and play from start
      setCurrentIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }, [currentIndex, sortedVisits.length, isPlaying])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }, [])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(e.target.value))
  }, [])

  if (!mapboxToken) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium text-slate-800 mb-2">Timeline Not Available</p>
          <p className="text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to enable timeline</p>
        </div>
      </div>
    )
  }

  if (sortedVisits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium text-slate-800 mb-2">No Visits to Show</p>
          <p className="text-sm">Record some visits to see the timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Visit Timeline</h3>
      </div>

      <div className="h-[250px] sm:h-[300px] md:h-[350px] relative">
        <Map
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={mapboxToken}
        >
          <NavigationControl position="top-right" />

          {visibleVisits.map((visit, index) => (
            <Marker
              key={visit.id}
              latitude={visit.latitude!}
              longitude={visit.longitude!}
              anchor="bottom"
            >
              <div
                className={`rounded-full border-2 border-white shadow-md transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-8 bg-blue-600 animate-pulse'
                    : 'w-5 h-5 bg-green-500'
                }`}
              />
            </Marker>
          ))}
        </Map>

        {/* Current visit info overlay */}
        {currentVisit && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[calc(100%-1rem)] sm:max-w-xs">
            <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">{currentVisit.facility_name}</p>
            <p className="text-xs sm:text-sm text-slate-500">{currentVisit.type}</p>
            <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">
              {new Date(currentVisit.visit_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 space-y-3">
        {/* Progress slider */}
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-slate-500 w-16 sm:w-24 flex-shrink-0">
            {currentIndex + 1} of {sortedVisits.length}
          </span>
          <input
            type="range"
            min="0"
            max={sortedVisits.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-slate-500 hidden sm:inline">Speed:</span>
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

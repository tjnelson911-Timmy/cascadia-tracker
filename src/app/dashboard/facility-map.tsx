'use client'

/**
 * Facility Map Component
 *
 * Interactive Mapbox map with advanced features:
 * - Green/gray pins for visited/unvisited facilities
 * - Filter by type and status
 * - Heatmap view for visit frequency
 * - Route planning between facilities
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import Map, { Marker, Popup, NavigationControl, Source, Layer, MapRef } from 'react-map-gl/mapbox'
import type { LayerProps } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Facility {
  id: string
  facility_name: string
  type: string
  address: string | null
  city: string | null
  state: string | null
  county: string | null
  latitude: number | null
  longitude: number | null
  visited: boolean
  visit_date: string | null
}

interface FacilityMapProps {
  facilities: Facility[]
}

// Heatmap layer style
const heatmapLayer: LayerProps = {
  id: 'heatmap',
  type: 'heatmap',
  paint: {
    'heatmap-weight': ['get', 'weight'],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    'heatmap-opacity': 0.8
  }
}

// Route line layer style
const routeLayer: LayerProps = {
  id: 'route',
  type: 'line',
  paint: {
    'line-color': '#1397a5',
    'line-width': 4,
    'line-opacity': 0.8
  }
}

export default function FacilityMap({ facilities }: FacilityMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers')
  const [routeMode, setRouteMode] = useState(false)
  const [routeStops, setRouteStops] = useState<Facility[]>([])
  const [routeData, setRouteData] = useState<GeoJSON.LineString | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Get unique values for filters
  const facilityTypes = useMemo(() => {
    return [...new Set(facilities.map(f => f.type).filter(Boolean))].sort()
  }, [facilities])

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter(f => {
      if (!f.latitude || !f.longitude) return false
      if (typeFilter && f.type !== typeFilter) return false
      if (statusFilter === 'visited' && !f.visited) return false
      if (statusFilter === 'unvisited' && f.visited) return false
      return true
    })
  }, [facilities, typeFilter, statusFilter])

  // Heatmap GeoJSON data
  const heatmapData = useMemo(() => {
    const features = filteredFacilities.map(f => ({
      type: 'Feature' as const,
      properties: {
        weight: f.visited ? 1 : 0.3
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [f.longitude!, f.latitude!]
      }
    }))

    return {
      type: 'FeatureCollection' as const,
      features
    }
  }, [filteredFacilities])

  // Route GeoJSON
  const routeGeoJson = useMemo(() => {
    if (!routeData) return null
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: routeData
    }
  }, [routeData])

  // Calculate initial view state
  const initialViewState = useMemo(() => {
    const withCoords = filteredFacilities.filter(f => f.latitude && f.longitude)
    if (withCoords.length === 0) {
      return { latitude: 47.5, longitude: -122.0, zoom: 7 }
    }

    let sumLat = 0, sumLng = 0
    withCoords.forEach(f => {
      sumLat += f.latitude!
      sumLng += f.longitude!
    })

    return {
      latitude: sumLat / withCoords.length,
      longitude: sumLng / withCoords.length,
      zoom: 6,
    }
  }, [filteredFacilities])

  // Handle facility click in route mode
  const handleFacilityClick = useCallback((facility: Facility) => {
    if (routeMode) {
      if (routeStops.find(s => s.id === facility.id)) {
        setRouteStops(prev => prev.filter(s => s.id !== facility.id))
      } else {
        setRouteStops(prev => [...prev, facility])
      }
    } else {
      setSelectedFacility(facility)
    }
  }, [routeMode, routeStops])

  // Fetch route from Mapbox
  const calculateRoute = useCallback(async () => {
    if (routeStops.length < 2 || !mapboxToken) return

    const coordinates = routeStops
      .map(s => `${s.longitude},${s.latitude}`)
      .join(';')

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxToken}`
      )
      const data = await response.json()

      if (data.routes && data.routes[0]) {
        setRouteData(data.routes[0].geometry)
        const distance = (data.routes[0].distance / 1609.34).toFixed(1) // Convert to miles
        const duration = Math.round(data.routes[0].duration / 60) // Convert to minutes
        setRouteInfo({
          distance: `${distance} mi`,
          duration: duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration} min`
        })
      }
    } catch (error) {
      console.error('Failed to fetch route:', error)
    }
  }, [routeStops, mapboxToken])

  // Clear route
  const clearRoute = useCallback(() => {
    setRouteStops([])
    setRouteData(null)
    setRouteInfo(null)
    setRouteMode(false)
  }, [])

  // Stats
  const totalWithCoords = facilities.filter(f => f.latitude && f.longitude).length
  const visitedCount = facilities.filter(f => f.visited && f.latitude && f.longitude).length
  const unvisitedCount = totalWithCoords - visitedCount

  if (!mapboxToken) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium text-slate-800 mb-2">Map Not Configured</p>
          <p className="text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file</p>
        </div>
      </div>
    )
  }

  if (totalWithCoords === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium text-slate-800 mb-2">No Facilities to Map</p>
          <p className="text-sm">Geocode your facilities to see them on the map.</p>
          <a href="/admin/geocode-facilities" className="inline-block mt-4 text-cascadia-600 hover:text-cascadia-700 font-medium">
            Geocode Facilities →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden rounded-2xl shadow-md">
      {/* Header with filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cascadia-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cascadia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Facility Map</h3>
              <p className="text-sm text-slate-500">{totalWithCoords} locations mapped</p>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-cascadia-500"
            >
              <option value="">All Types</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1.5 text-xs font-medium ${statusFilter === 'all' ? 'bg-cascadia-600 text-white' : 'bg-white text-slate-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('visited')}
                className={`px-2 py-1.5 text-xs font-medium border-l border-slate-200 ${statusFilter === 'visited' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}
              >
                Visited
              </button>
              <button
                onClick={() => setStatusFilter('unvisited')}
                className={`px-2 py-1.5 text-xs font-medium border-l border-slate-200 ${statusFilter === 'unvisited' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600'}`}
              >
                Unvisited
              </button>
            </div>
          </div>
        </div>

        {/* View Mode & Route Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-medium text-xs">Visited ({visitedCount})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 font-medium text-xs">Not Visited ({unvisitedCount})</span>
            </div>
            {filteredFacilities.length !== totalWithCoords && (
              <span className="text-slate-400 text-xs">
                Showing {filteredFacilities.length} of {totalWithCoords}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('markers')}
                className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'markers' ? 'bg-cascadia-600 text-white' : 'bg-white text-slate-600'}`}
              >
                Markers
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 text-xs font-medium border-l border-slate-200 ${viewMode === 'heatmap' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600'}`}
              >
                Heatmap
              </button>
            </div>

            {/* Route Button */}
            <button
              onClick={() => routeMode ? clearRoute() : setRouteMode(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                routeMode
                  ? 'bg-cascadia-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {routeMode ? 'Cancel Route' : 'Plan Route'}
            </button>
          </div>
        </div>

        {/* Route Info */}
        {routeMode && (
          <div className="mt-3 p-3 bg-cascadia-50 rounded-lg">
            <p className="text-sm text-cascadia-800 font-medium">
              Click facilities to add to route ({routeStops.length} stops)
            </p>
            {routeStops.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {routeStops.map((stop, i) => (
                  <span key={stop.id} className="inline-flex items-center gap-1 text-xs bg-cascadia-100 text-cascadia-700 px-2 py-1 rounded">
                    {i + 1}. {stop.facility_name}
                    <button onClick={() => setRouteStops(prev => prev.filter(s => s.id !== stop.id))} className="ml-1 text-cascadia-500 hover:text-cascadia-700">×</button>
                  </span>
                ))}
              </div>
            )}
            {routeStops.length >= 2 && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={calculateRoute}
                  className="px-3 py-1.5 text-sm font-medium bg-cascadia-600 text-white rounded-lg hover:bg-cascadia-700"
                >
                  Calculate Route
                </button>
                {routeInfo && (
                  <span className="text-sm text-cascadia-700">
                    {routeInfo.distance} · {routeInfo.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-[300px] sm:h-[350px] md:h-[450px]">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={mapboxToken}
          maxBounds={[[-130, 24], [-65, 50]]}
          minZoom={3}
          maxZoom={15}
        >
          <NavigationControl position="top-right" />

          {/* Heatmap Layer */}
          {viewMode === 'heatmap' && (
            <Source type="geojson" data={heatmapData}>
              <Layer {...heatmapLayer} />
            </Source>
          )}

          {/* Route Layer */}
          {routeGeoJson && (
            <Source type="geojson" data={routeGeoJson}>
              <Layer {...routeLayer} />
            </Source>
          )}

          {/* Markers View */}
          {viewMode === 'markers' && filteredFacilities.map(facility => (
            <Marker
              key={facility.id}
              latitude={facility.latitude!}
              longitude={facility.longitude!}
              anchor="bottom"
              onClick={() => handleFacilityClick(facility)}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125 ${
                  routeStops.find(s => s.id === facility.id)
                    ? 'bg-cascadia-600 ring-2 ring-cascadia-300'
                    : facility.visited ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                onMouseEnter={() => !routeMode && setHoveredFacility(facility)}
                onMouseLeave={() => setHoveredFacility(null)}
              >
                {routeStops.find(s => s.id === facility.id) && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    {routeStops.findIndex(s => s.id === facility.id) + 1}
                  </span>
                )}
              </div>
            </Marker>
          ))}

          {/* Hover tooltip */}
          {hoveredFacility && !selectedFacility && hoveredFacility.latitude && hoveredFacility.longitude && (
            <Popup
              latitude={hoveredFacility.latitude}
              longitude={hoveredFacility.longitude}
              anchor="bottom"
              closeButton={false}
              closeOnClick={false}
              offset={15}
            >
              <div className="px-2 py-1 text-sm font-medium text-slate-800">
                {hoveredFacility.facility_name}
              </div>
            </Popup>
          )}

          {/* Selected facility popup */}
          {selectedFacility && !routeMode && selectedFacility.latitude && selectedFacility.longitude && (
            <Popup
              latitude={selectedFacility.latitude}
              longitude={selectedFacility.longitude}
              anchor="bottom"
              onClose={() => setSelectedFacility(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold text-slate-800">{selectedFacility.facility_name}</h4>
                <p className="text-sm text-slate-500 mt-1">{selectedFacility.type}</p>
                {selectedFacility.county && (
                  <p className="text-xs text-slate-400">{selectedFacility.county} County</p>
                )}
                {selectedFacility.address && (
                  <p className="text-sm text-slate-600 mt-2">
                    {[selectedFacility.address, selectedFacility.city, selectedFacility.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  {selectedFacility.visited ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visited {selectedFacility.visit_date}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Not yet visited</span>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  )
}

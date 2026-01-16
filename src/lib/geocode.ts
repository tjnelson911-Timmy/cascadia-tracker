/**
 * Geocoding Utility
 *
 * Converts addresses to latitude/longitude coordinates
 * using the Mapbox Geocoding API.
 */

interface GeocodeResult {
  latitude: number
  longitude: number
  confidence: string
}

export async function geocodeAddress(
  address: string,
  city: string | null,
  state: string | null,
  zip: string | null
): Promise<GeocodeResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!mapboxToken) {
    throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not configured')
  }

  // Build full address string
  const parts = [address, city, state, zip].filter(Boolean)
  const fullAddress = parts.join(', ')

  if (!fullAddress.trim()) {
    return null
  }

  // URL encode the address
  const encodedAddress = encodeURIComponent(fullAddress)

  // Call Mapbox Geocoding API
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1&country=US`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      console.warn('No geocoding results for:', fullAddress)
      return null
    }

    const feature = data.features[0]
    const [longitude, latitude] = feature.center

    // Determine confidence based on relevance score
    let confidence = 'low'
    if (feature.relevance > 0.9) {
      confidence = 'high'
    } else if (feature.relevance > 0.7) {
      confidence = 'medium'
    }

    return {
      latitude,
      longitude,
      confidence,
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error)
    return null
  }
}

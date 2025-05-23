const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

export interface PlaceResult {
  place_id: string
  name: string
  rating?: number
  price_level?: number
  vicinity: string
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: Array<{
    photo_reference: string
  }>
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number }
      duration: { text: string; value: number }
      steps: Array<{
        html_instructions: string
        distance: { text: string }
        duration: { text: string }
        travel_mode: string
      }>
    }>
    overview_polyline: { points: string }
  }>
}

export async function getNearbyPlaces(lat: number, lng: number, type: string, radius = 1000): Promise<PlaceResult[]> {
  try {
    const response = await fetch(`/api/places?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`)

    if (!response.ok) {
      throw new Error("Failed to fetch places")
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching nearby places:", error)
    return []
  }
}

export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "DRIVING" | "WALKING" | "TRANSIT" = "DRIVING",
): Promise<DirectionsResult | null> {
  try {
    const response = await fetch(
      `/api/directions?originLat=${origin.lat}&originLng=${origin.lng}&destLat=${destination.lat}&destLng=${destination.lng}&mode=${mode}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch directions")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching directions:", error)
    return null
  }
}

export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return "/placeholder.svg"
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`
}

// Test function to verify API key works
export async function testGoogleMapsAPI(): Promise<boolean> {
  try {
    // Test with a simple geocoding request
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Oslo,Norway&key=${GOOGLE_MAPS_API_KEY}`,
    )
    return response.ok
  } catch (error) {
    console.error("Google Maps API test failed:", error)
    return false
  }
}

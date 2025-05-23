import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const originLat = searchParams.get("originLat")
  const originLng = searchParams.get("originLng")
  const destLat = searchParams.get("destLat")
  const destLng = searchParams.get("destLng")
  const mode = searchParams.get("mode") || "DRIVING"

  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const origin = `${originLat},${originLng}`
    const destination = `${destLat},${destLng}`

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to fetch directions")
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Directions API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const type = searchParams.get("type")
  const radius = searchParams.get("radius") || "1000"

  if (!lat || !lng || !type) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to fetch places")
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Places API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

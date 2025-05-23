import { type NextRequest, NextResponse } from "next/server"
import { fetchWeatherData } from "@/lib/weather-service"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    const weatherData = await fetchWeatherData(Number.parseFloat(lat), Number.parseFloat(lon))
    return NextResponse.json(weatherData)
  } catch (error: any) {
    console.error("Weather API error:", error)

    if (error.message.includes("401")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    } else if (error.message.includes("429")) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    } else {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }
  }
}

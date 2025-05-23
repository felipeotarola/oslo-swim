"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchWeatherData, getWeatherIconUrl, testWeatherAPI, type WeatherData } from "@/lib/weather-service"
import { bathingSpots } from "@/lib/data"

interface SpotWeather {
  spotId: string
  spotName: string
  weather: WeatherData | null
  error: boolean
}

export function WeatherOverview() {
  const [spotsWeather, setSpotsWeather] = useState<SpotWeather[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const loadAllWeatherData = async () => {
      setIsLoading(true)
      setApiError(null)

      try {
        // First test if API key works
        const apiWorking = await testWeatherAPI()
        if (!apiWorking) {
          setApiError("Weather API key is not configured correctly. Please check your environment variables.")
          setIsLoading(false)
          return
        }

        // Load weather for first 3 spots to avoid hitting rate limits
        const spotsToLoad = bathingSpots.slice(0, 3)

        const weatherPromises = spotsToLoad.map(async (spot) => {
          try {
            const weather = await fetchWeatherData(spot.coordinates.lat, spot.coordinates.lon)
            return {
              spotId: spot.id,
              spotName: spot.name,
              weather,
              error: false,
            }
          } catch (error) {
            console.error(`Error fetching weather for ${spot.name}:`, error)
            return {
              spotId: spot.id,
              spotName: spot.name,
              weather: null,
              error: true,
            }
          }
        })

        const results = await Promise.all(weatherPromises)
        setSpotsWeather(results)
      } catch (error) {
        console.error("Error loading weather overview:", error)
        setApiError("Failed to load weather data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAllWeatherData()
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-white border-sky-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-sky-800">Weather Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (apiError) {
    return (
      <Card className="bg-white border-sky-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-sky-800">Weather Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const validWeatherSpots = spotsWeather.filter((spot) => spot.weather && !spot.error)

  if (validWeatherSpots.length === 0) {
    return (
      <Card className="bg-white border-sky-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-sky-800">Weather Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Weather data temporarily unavailable. Please check your API configuration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Sort by temperature (warmest first)
  const sortedSpots = validWeatherSpots.sort((a, b) => {
    if (!a.weather || !b.weather) return 0
    return b.weather.current.temp - a.weather.current.temp
  })

  const getTemperatureBadge = (temp: number) => {
    if (temp >= 20) return <Badge className="bg-green-500">Warm</Badge>
    if (temp >= 15) return <Badge className="bg-yellow-500">Moderate</Badge>
    return <Badge className="bg-blue-500">Cool</Badge>
  }

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-sky-800">Weather Overview</CardTitle>
        <p className="text-sm text-sky-600">Current conditions at bathing spots</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSpots.map((spot) => {
          if (!spot.weather) return null

          const { current } = spot.weather

          return (
            <Link key={spot.spotId} href={`/spot/${spot.spotId}`}>
              <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Image
                    src={getWeatherIconUrl(current.weather[0].icon) || "/placeholder.svg"}
                    alt={current.weather[0].description}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium text-sky-900">{spot.spotName}</p>
                    <p className="text-sm text-sky-600 capitalize">{current.weather[0].description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTemperatureBadge(current.temp)}
                  <span className="text-lg font-bold text-sky-900">{Math.round(current.temp)}°C</span>
                </div>
              </div>
            </Link>
          )
        })}

        <div className="text-center pt-2">
          <Link href="/" className="text-sm text-sky-600 hover:underline">
            View all spots →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

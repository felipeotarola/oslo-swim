"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Cloud, Droplets, Thermometer, Wind, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  fetchWeatherData,
  getWeatherIconUrl,
  formatWeatherDescription,
  testWeatherAPI,
  type WeatherData,
} from "@/lib/weather-service"

interface WeatherDisplayProps {
  lat: number
  lon: number
  spotName: string
}

export function WeatherDisplay({ lat, lon, spotName }: WeatherDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First test if API key works
        const apiWorking = await testWeatherAPI()
        if (!apiWorking) {
          throw new Error("Weather API key is not configured correctly")
        }

        const data = await fetchWeatherData(lat, lon)
        setWeatherData(data)
      } catch (err: any) {
        console.error("Error fetching weather data:", err)
        if (err.message.includes("401")) {
          setError("Weather API key is invalid or not configured")
        } else if (err.message.includes("429")) {
          setError("Weather API rate limit exceeded")
        } else {
          setError("Failed to load weather data")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadWeatherData()
  }, [lat, lon])

  if (isLoading) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weatherData) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Weather data unavailable"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const { current } = weatherData

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-sky-800">Current Weather</CardTitle>
        <p className="text-sm text-sky-600">at {spotName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main weather info */}
        <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Image
              src={getWeatherIconUrl(current.weather[0].icon) || "/placeholder.svg"}
              alt={current.weather[0].description}
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div>
              <p className="text-2xl font-bold text-sky-900">{Math.round(current.temp)}°C</p>
              <p className="text-sm text-sky-700 capitalize">
                {formatWeatherDescription(current.weather[0].description)}
              </p>
            </div>
          </div>
        </div>

        {/* Additional weather details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center p-3 bg-sky-50 rounded-lg">
            <Thermometer className="h-5 w-5 text-sky-700 mr-2" />
            <div>
              <p className="text-xs text-sky-600">Feels like</p>
              <p className="font-medium text-sky-900">{Math.round(current.feels_like)}°C</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-sky-50 rounded-lg">
            <Droplets className="h-5 w-5 text-sky-700 mr-2" />
            <div>
              <p className="text-xs text-sky-600">Humidity</p>
              <p className="font-medium text-sky-900">{current.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-sky-50 rounded-lg">
            <Wind className="h-5 w-5 text-sky-700 mr-2" />
            <div>
              <p className="text-xs text-sky-600">Wind</p>
              <p className="font-medium text-sky-900">{Math.round(current.wind_speed * 3.6)} km/h</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-sky-50 rounded-lg">
            <Cloud className="h-5 w-5 text-sky-700 mr-2" />
            <div>
              <p className="text-xs text-sky-600">Condition</p>
              <p className="font-medium text-sky-900">{current.weather[0].main}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

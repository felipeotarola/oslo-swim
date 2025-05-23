"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWeatherData, getWeatherIconUrl, getDayName, type WeatherData } from "@/lib/weather-service"

interface WeatherForecastProps {
  lat: number
  lon: number
}

export function WeatherForecast({ lat, lon }: WeatherForecastProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchWeatherData(lat, lon)
        setWeatherData(data)
      } catch (err) {
        console.error("Error fetching weather data:", err)
        setError("Failed to load forecast data")
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
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
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
          <p className="text-red-600 text-center">{error || "Forecast data unavailable"}</p>
        </CardContent>
      </Card>
    )
  }

  // Get next 3 days from daily forecast
  const forecast = weatherData.daily.slice(0, 3)

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-sky-800">3-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          {forecast.map((day, index) => (
            <div key={index} className="p-3 bg-sky-50 rounded-lg">
              <p className="font-medium text-sky-800 text-sm mb-2">{getDayName(day.dt)}</p>
              <div className="mb-2">
                <Image
                  src={getWeatherIconUrl(day.weather[0].icon) || "/placeholder.svg"}
                  alt={day.weather[0].description}
                  width={40}
                  height={40}
                  className="mx-auto"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-sky-900">{Math.round(day.temp.max)}°</p>
                <p className="text-xs text-sky-600">{Math.round(day.temp.min)}°</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

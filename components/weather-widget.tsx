"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { fetchWeatherData, getWeatherIconUrl, type WeatherData } from "@/lib/weather-service"

interface WeatherWidgetProps {
  lat: number
  lon: number
  className?: string
}

export function WeatherWidget({ lat, lon, className = "" }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const data = await fetchWeatherData(lat, lon)
        setWeatherData(data)
      } catch (error) {
        console.error("Error fetching weather data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeatherData()
  }, [lat, lon])

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!weatherData) {
    return null
  }

  const { current } = weatherData

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src={getWeatherIconUrl(current.weather[0].icon) || "/placeholder.svg"}
        alt={current.weather[0].description}
        width={32}
        height={32}
        className="rounded"
      />
      <span className="text-sm font-medium text-sky-700">{Math.round(current.temp)}°C</span>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Sunset, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SunsetTimerProps {
  lat: number
  lon: number
  showSunset: boolean
}

export function SunsetTimer({ lat, lon, showSunset }: SunsetTimerProps) {
  const [sunsetTime, setSunsetTime] = useState<string | null>(null)
  const [timeToSunset, setTimeToSunset] = useState<string | null>(null)

  useEffect(() => {
    const calculateSunset = () => {
      // Simple sunset calculation (approximate)
      const now = new Date()
      const sunset = new Date()

      // Approximate sunset time for Oslo in summer (adjust based on season)
      const month = now.getMonth()
      let sunsetHour = 22 // Default summer sunset around 10 PM

      if (month >= 3 && month <= 8) {
        // Spring/Summer: later sunsets
        sunsetHour = 22
      } else {
        // Fall/Winter: earlier sunsets
        sunsetHour = 16
      }

      sunset.setHours(sunsetHour, 0, 0, 0)

      setSunsetTime(
        sunset.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )

      // Calculate time until sunset
      const timeDiff = sunset.getTime() - now.getTime()
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeToSunset(`${hours}h ${minutes}m`)
      } else {
        setTimeToSunset("Sunset passed")
      }
    }

    calculateSunset()
    const interval = setInterval(calculateSunset, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lat, lon])

  if (!showSunset || !sunsetTime) return null

  return (
    <Card className="bg-gradient-to-r from-orange-100 to-pink-100 border-orange-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sunset className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">Sunset</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-orange-900">{sunsetTime}</p>
            {timeToSunset && (
              <p className="text-sm text-orange-700 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeToSunset}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

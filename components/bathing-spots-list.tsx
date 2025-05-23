"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Droplets, MapPin, ThermometerIcon, Beer, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bathingSpots } from "@/lib/data"
import { WeatherWidget } from "@/components/weather-widget"
import { PartyLevel } from "@/components/party-level"

export default function BathingSpotsList() {
  const [sortBy, setSortBy] = useState<"name" | "temperature" | "party">("temperature")

  const sortedSpots = [...bathingSpots].sort((a, b) => {
    if (sortBy === "temperature") {
      return b.waterTemperature - a.waterTemperature
    } else if (sortBy === "party") {
      const partyOrder = { "Party-Friendly": 3, Chill: 2, Quiet: 1 }
      return partyOrder[b.partyLevel] - partyOrder[a.partyLevel]
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 text-sm text-sky-700">
          <span>Sort by:</span>
          <button
            onClick={() => setSortBy("temperature")}
            className={`px-3 py-1 rounded-full ${sortBy === "temperature" ? "bg-sky-100 font-medium" : ""}`}
          >
            Temperature
          </button>
          <button
            onClick={() => setSortBy("party")}
            className={`px-3 py-1 rounded-full ${sortBy === "party" ? "bg-sky-100 font-medium" : ""}`}
          >
            Party Vibes
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 rounded-full ${sortBy === "name" ? "bg-sky-100 font-medium" : ""}`}
          >
            Name
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSpots.map((spot) => (
          <Link href={`/spot/${spot.id}`} key={spot.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
              <div className="relative h-48">
                <Image src={spot.imageUrl || "/placeholder.svg"} alt={spot.name} fill className="object-cover" />
                {spot.waterTemperature >= 20 ? (
                  <Badge className="absolute top-3 right-3 bg-green-500">Warm</Badge>
                ) : spot.waterTemperature >= 15 ? (
                  <Badge className="absolute top-3 right-3 bg-yellow-500">Moderate</Badge>
                ) : (
                  <Badge className="absolute top-3 right-3 bg-blue-500">Cool</Badge>
                )}

                {/* Party indicators */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {spot.byobFriendly && (
                    <Badge className="bg-orange-500/90 text-xs">
                      <Beer className="h-2 w-2 mr-1" />
                      BYOB
                    </Badge>
                  )}
                  {spot.sunsetViews && (
                    <Badge className="bg-pink-500/90 text-xs">
                      <Sparkles className="h-2 w-2 mr-1" />
                      Sunset
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-sky-800 mb-2">{spot.name}</h3>
                <div className="flex items-center text-sky-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{spot.location}</span>
                </div>

                <div className="mb-3">
                  <PartyLevel level={spot.partyLevel} className="mb-2" />
                  <WeatherWidget lat={spot.coordinates.lat} lon={spot.coordinates.lon} className="justify-start" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <ThermometerIcon className="h-5 w-5 text-sky-700" />
                    <span className="font-medium text-lg">{spot.waterTemperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-sky-600">
                    <Droplets className="h-4 w-4" />
                    <span>{spot.waterQuality}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

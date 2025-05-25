"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { GoogleMap } from "@/components/google-map"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAllSpots, type UnifiedSpot } from "@/lib/spots-service"

export default function MapPage() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)
  const [allSpots, setAllSpots] = useState<UnifiedSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const spots = await getAllSpots()
        setAllSpots(spots)
      } catch (error) {
        console.error("Error fetching spots:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSpots()
  }, [])

  // Oslo center coordinates
  const osloCenter = { lat: 59.9139, lng: 10.7522 }

  // Create markers for all bathing spots
  const markers = allSpots.map((spot) => ({
    position: { lat: spot.coordinates.lat, lng: spot.coordinates.lon },
    title: spot.name,
    info: `
    <div style="padding: 8px; max-width: 200px;">
      <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #0c4a6e;">${spot.name}</h3>
      ${spot.isCommunitySpot ? '<span style="background: #9333ea; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">Community</span>' : ""}
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #0369a1;">${spot.location}</p>
      <p style="margin: 0 0 8px 0; font-size: 12px;">Water: ${spot.waterTemperature}°C</p>
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <span style="background: ${spot.partyLevel === "Party-Friendly" ? "#10b981" : spot.partyLevel === "Chill" ? "#f59e0b" : "#3b82f6"}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">${spot.partyLevel}</span>
        ${spot.byobFriendly ? '<span style="background: #f97316; color: white; padding: 2px 6px; border-radius: 12px; font-size: 10px;">BYOB</span>' : ""}
      </div>
      <a href="${spot.isCommunitySpot ? `/community-spot/${spot.communitySpotId}` : `/spot/${spot.id}`}" style="color: #0ea5e9; text-decoration: none; font-size: 12px;">View Details →</a>
    </div>
  `,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-sky-900 mb-6">Interactive Map</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <GoogleMap center={osloCenter} zoom={11} markers={markers} className="h-[600px]" />
              </CardContent>
            </Card>
          </div>

          {/* Spot List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-sky-800">Bathing Spots</h2>
            {allSpots.map((spot) => (
              <Card
                key={spot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSpot === spot.id ? "ring-2 ring-sky-500" : ""
                }`}
                onClick={() => setSelectedSpot(selectedSpot === spot.id ? null : spot.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sky-900">{spot.name}</h3>
                    {spot.isCommunitySpot && <Badge className="bg-purple-600 text-xs">Community</Badge>}
                  </div>
                  <p className="text-sm text-sky-600 mb-2">{spot.location}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge
                      className={`text-xs ${
                        spot.partyLevel === "Party-Friendly"
                          ? "bg-green-500"
                          : spot.partyLevel === "Chill"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {spot.partyLevel}
                    </Badge>
                    {spot.byobFriendly && <Badge className="bg-orange-500 text-xs">BYOB</Badge>}
                    {spot.sunsetViews && <Badge className="bg-pink-500 text-xs">Sunset</Badge>}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sky-700">Water: {spot.waterTemperature}°C</span>
                    <Link
                      href={spot.isCommunitySpot ? `/community-spot/${spot.communitySpotId}` : `/spot/${spot.id}`}
                      className="text-sky-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sky-800 mb-3">Party Level</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Party-Friendly</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Chill Vibes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Quiet Spots</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sky-800 mb-3">Features</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge className="bg-orange-500 text-xs mr-2">BYOB</Badge>
                  <span className="text-sm">Bring Your Own Drinks</span>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-pink-500 text-xs mr-2">Sunset</Badge>
                  <span className="text-sm">Great Sunset Views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sky-800 mb-3">How to Use</h3>
              <div className="space-y-1 text-sm text-sky-700">
                <p>• Click markers for quick info</p>
                <p>• Click spot cards to highlight</p>
                <p>• Use "Details" for full info</p>
                <p>• Get directions from each spot page</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Bringing good vibes to Oslo beaches 🌊🍻</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, ThermometerIcon, Droplets, Star, X, Navigation } from "lucide-react"
import { Header } from "@/components/header"
import { GoogleMap } from "@/components/google-map"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getAllSpots, type UnifiedSpot } from "@/lib/unified-spots-service"
import { PartyLevel } from "@/components/party-level"
import { WeatherWidget } from "@/components/weather-widget"
import { WeatherDisplay } from "@/components/weather-display"
import { Directions } from "@/components/directions"
import { NearbyPlaces } from "@/components/nearby-places"
import { SunsetTimer } from "@/components/sunset-timer"

export default function BeachesPage() {
  const [selectedSpot, setSelectedSpot] = useState<UnifiedSpot | null>(null)
  const [allSpots, setAllSpots] = useState<UnifiedSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

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
      <button onclick="window.selectSpotFromMap('${spot.id}')" style="color: #0ea5e9; text-decoration: none; font-size: 12px; background: none; border: none; cursor: pointer;">View Details →</button>
    </div>
  `,
  }))

  // Add global function to handle map marker clicks
  useEffect(() => {
    ;(window as any).selectSpotFromMap = (spotId: string) => {
      const spot = allSpots.find((s) => s.id === spotId)
      if (spot) {
        setSelectedSpot(spot)
        setShowDetails(true)
      }
    }

    return () => {
      delete (window as any).selectSpotFromMap
    }
  }, [allSpots])

  const handleSpotClick = (spot: UnifiedSpot) => {
    setSelectedSpot(spot)
    setShowDetails(true)
  }

  const getSpotLink = (spot: UnifiedSpot) => {
    if (spot.isCommunitySpot && spot.communitySpotId) {
      return `/community-spot/${spot.communitySpotId}`
    }
    return `/spot/${spot.id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-900">Oslo Beaches & Swimming Spots</h1>
            <p className="text-sky-600">
              Discover {allSpots.length} amazing places to swim • {allSpots.filter((s) => s.isCommunitySpot).length}{" "}
              community spots
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <GoogleMap center={osloCenter} zoom={11} markers={markers} className="h-[600px]" />
              </CardContent>
            </Card>

            {/* Map Legend */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex items-center">
                      <Badge className="bg-purple-600 text-xs mr-2">Community</Badge>
                      <span className="text-sm">User Submitted</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sky-800 mb-3">How to Use</h3>
                  <div className="space-y-1 text-sm text-sky-700">
                    <p>• Click markers for quick info</p>
                    <p>• Click spot cards for details</p>
                    <p>• Get directions & nearby places</p>
                    <p>• Check weather conditions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Spot List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-sky-800">All Beaches</h2>
              <Badge variant="outline" className="text-xs">
                {allSpots.length} spots
              </Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {allSpots.map((spot) => (
                <Card
                  key={spot.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSpot?.id === spot.id ? "ring-2 ring-sky-500 bg-sky-50" : ""
                  }`}
                  onClick={() => handleSpotClick(spot)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-sky-900 text-sm leading-tight">{spot.name}</h3>
                        <p className="text-xs text-sky-600 mt-1">{spot.location}</p>
                      </div>
                      {spot.isCommunitySpot && <Badge className="bg-purple-600 text-xs ml-2">Community</Badge>}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <ThermometerIcon className="h-3 w-3 text-sky-700" />
                        <span className="text-xs font-medium">{spot.waterTemperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-sky-700" />
                        <span className="text-xs">{spot.waterQuality}</span>
                      </div>
                    </div>

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

                    <div className="flex items-center justify-between">
                      <WeatherWidget lat={spot.coordinates.lat} lon={spot.coordinates.lon} className="text-xs" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 text-sky-600 hover:text-sky-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(getSpotLink(spot), "_blank")
                        }}
                      >
                        Full Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Spot Information Sheet */}
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent side="right" className="w-full sm:w-[600px] overflow-y-auto">
            {selectedSpot && (
              <>
                <SheetHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <SheetTitle className="text-xl text-sky-900">{selectedSpot.name}</SheetTitle>
                      <div className="flex items-center text-sky-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{selectedSpot.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={selectedSpot.imageUrl || "/placeholder.svg"}
                      alt={selectedSpot.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {selectedSpot.isCommunitySpot && (
                        <Badge className="bg-purple-600 flex items-center gap-1">
                          <Star className="h-2 w-2" />
                          Community
                        </Badge>
                      )}
                      {selectedSpot.byobFriendly && <Badge className="bg-orange-500 text-xs">BYOB</Badge>}
                      {selectedSpot.sunsetViews && <Badge className="bg-pink-500 text-xs">Sunset</Badge>}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-sky-50 rounded-lg">
                      <ThermometerIcon className="h-5 w-5 text-sky-700 mx-auto mb-1" />
                      <p className="text-lg font-bold text-sky-900">{selectedSpot.waterTemperature}°C</p>
                      <p className="text-xs text-sky-600">Water Temp</p>
                    </div>
                    <div className="text-center p-3 bg-sky-50 rounded-lg">
                      <Droplets className="h-5 w-5 text-sky-700 mx-auto mb-1" />
                      <p className="text-sm font-bold text-sky-900">{selectedSpot.waterQuality}</p>
                      <p className="text-xs text-sky-600">Water Quality</p>
                    </div>
                    <div className="text-center p-3 bg-sky-50 rounded-lg">
                      <Navigation className="h-5 w-5 text-sky-700 mx-auto mb-1" />
                      <p className="text-sm font-bold text-sky-900">{selectedSpot.crowdLevel}</p>
                      <p className="text-xs text-sky-600">Crowd Level</p>
                    </div>
                  </div>

                  {/* Party Level */}
                  <div className="flex justify-center">
                    <PartyLevel level={selectedSpot.partyLevel} />
                  </div>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-sky-800 mb-2">About This Spot</h3>
                    <p className="text-sm text-gray-700">{selectedSpot.description}</p>
                  </div>

                  {/* Weather */}
                  <WeatherDisplay
                    lat={selectedSpot.coordinates.lat}
                    lon={selectedSpot.coordinates.lon}
                    spotName={selectedSpot.name}
                  />

                  {/* Sunset Timer */}
                  {selectedSpot.sunsetViews && (
                    <SunsetTimer
                      lat={selectedSpot.coordinates.lat}
                      lon={selectedSpot.coordinates.lon}
                      showSunset={selectedSpot.sunsetViews}
                    />
                  )}

                  {/* Directions */}
                  <Directions
                    destination={{ lat: selectedSpot.coordinates.lat, lng: selectedSpot.coordinates.lon }}
                    destinationName={selectedSpot.name}
                  />

                  {/* Nearby Places */}
                  <NearbyPlaces
                    lat={selectedSpot.coordinates.lat}
                    lng={selectedSpot.coordinates.lon}
                    spotName={selectedSpot.name}
                  />

                  {/* Facilities */}
                  {selectedSpot.facilities && selectedSpot.facilities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sky-800 mb-3">Facilities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSpot.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center text-sm text-sky-700">
                            <span className="h-2 w-2 bg-sky-400 rounded-full mr-2"></span>
                            {facility}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button asChild className="flex-1 bg-sky-600 hover:bg-sky-700">
                      <Link href={getSpotLink(selectedSpot)}>
                        <Navigation className="h-4 w-4 mr-2" />
                        Full Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-sky-600 text-sky-600 hover:bg-sky-100"
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.coordinates.lat},${selectedSpot.coordinates.lon}`
                        window.open(url, "_blank")
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Bringing good vibes to Oslo beaches 🌊🍻</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Navigation, Car, MapPin, Clock, Route } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getDirections, testGoogleMapsAPI, type DirectionsResult } from "@/lib/google-maps-service"

interface DirectionsProps {
  destination: { lat: number; lng: number }
  destinationName: string
}

export function Directions({ destination, destinationName }: DirectionsProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [directions, setDirections] = useState<DirectionsResult | null>(null)
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "TRANSIT">("DRIVING")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    // Test if Google Maps API is available
    const checkAPI = async () => {
      const available = await testGoogleMapsAPI()
      setApiAvailable(available)
      if (!available) {
        setError("Google Maps API is not available")
      }
    }

    checkAPI()
  }, [])

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation && apiAvailable) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location")
        },
      )
    } else if (apiAvailable === false) {
      setError("Google Maps API is not configured")
    } else if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
    }
  }, [apiAvailable])

  const fetchDirections = async () => {
    if (!userLocation || !apiAvailable) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getDirections(userLocation, destination, travelMode)
      setDirections(result)
    } catch (err) {
      setError("Failed to get directions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userLocation && apiAvailable) {
      fetchDirections()
    }
  }, [userLocation, travelMode, apiAvailable])

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=${travelMode.toLowerCase()}`
    window.open(url, "_blank")
  }

  if (apiAvailable === false) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Google Maps API is not configured. Please check your environment variables.
            </AlertDescription>
          </Alert>
          <Button onClick={openInGoogleMaps} className="mt-4 w-full bg-sky-600 hover:bg-sky-700">
            Open in Google Maps
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={openInGoogleMaps} className="mt-4 bg-sky-600 hover:bg-sky-700">
              Open in Google Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userLocation) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-2">Getting your location...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-sky-800 flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Directions to {destinationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Travel Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={travelMode === "DRIVING" ? "default" : "outline"}
            size="sm"
            onClick={() => setTravelMode("DRIVING")}
            className={travelMode === "DRIVING" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            <Car className="h-4 w-4 mr-1" />
            Drive
          </Button>
          <Button
            variant={travelMode === "WALKING" ? "default" : "outline"}
            size="sm"
            onClick={() => setTravelMode("WALKING")}
            className={travelMode === "WALKING" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Walk
          </Button>
          <Button
            variant={travelMode === "TRANSIT" ? "default" : "outline"}
            size="sm"
            onClick={() => setTravelMode("TRANSIT")}
            className={travelMode === "TRANSIT" ? "bg-sky-600 hover:bg-sky-700" : ""}
          >
            <Route className="h-4 w-4 mr-1" />
            Transit
          </Button>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : directions && directions.routes.length > 0 ? (
          <div className="space-y-3">
            {directions.routes[0].legs.map((leg, index) => (
              <div key={index} className="p-3 bg-sky-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-700" />
                    <span className="font-medium text-sky-900">{leg.duration.text}</span>
                  </div>
                  <Badge className="bg-sky-600">{leg.distance.text}</Badge>
                </div>

                {/* First few steps */}
                <div className="space-y-1 text-sm text-sky-700">
                  {leg.steps.slice(0, 3).map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <span className="text-xs bg-sky-200 rounded-full w-4 h-4 flex items-center justify-center mt-0.5">
                        {stepIndex + 1}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: step.html_instructions }} />
                    </div>
                  ))}
                  {leg.steps.length > 3 && (
                    <p className="text-xs text-sky-600 italic">+{leg.steps.length - 3} more steps...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No directions available</p>
        )}

        <Button onClick={openInGoogleMaps} className="w-full bg-sky-600 hover:bg-sky-700">
          Open Full Directions in Google Maps
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { MapPin, Search, Crosshair } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GoogleMap } from "@/components/google-map"
import { useToast } from "@/hooks/use-toast"

interface AddressInputProps {
  value: string
  onChange: (address: string) => void
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void
  placeholder?: string
}

export function AddressInput({ value, onChange, onCoordinatesChange, placeholder }: AddressInputProps) {
  const [showMap, setShowMap] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 59.9139, lng: 10.7522 }) // Default to Oslo center
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { toast } = useToast()

  const handleAddressSearch = async () => {
    if (!value.trim()) return

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(value)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        const newCoords = { lat: location.lat, lng: location.lng }

        setMapCenter(newCoords)
        setSelectedLocation(newCoords)
        onCoordinatesChange(newCoords)

        // Update address with the formatted address from Google
        onChange(data.results[0].formatted_address)
        setShowMap(true)
      } else {
        toast({
          title: "Location not found",
          description: "Could not find the specified address. Try a different search term.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast({
        title: "Search error",
        description: "Failed to search for the address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setSelectedLocation(coords)
        setMapCenter(coords)
        onCoordinatesChange(coords)
        setShowMap(true)

        // Reverse geocode to get address
        await reverseGeocode(coords)

        setIsGettingLocation(false)

        toast({
          title: "Location found",
          description: `Using your current location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        })
      },
      (error) => {
        setIsGettingLocation(false)
        console.error("Error getting location:", error)

        let errorMessage = "Failed to get your location."
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access denied. Please enable location permissions."
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable."
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out."
        }

        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleMapClick = (coordinates: { lat: number; lng: number }) => {
    setSelectedLocation(coordinates)
    onCoordinatesChange(coordinates)

    // Reverse geocode to get address
    reverseGeocode(coordinates)
  }

  const reverseGeocode = async (coordinates: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        onChange(data.results[0].formatted_address)
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
    }
  }

  const markers = selectedLocation
    ? [
        {
          position: selectedLocation,
          title: "Selected Location",
          info: `<div style="padding: 8px;"><h3 style="margin: 0; color: #0c4a6e;">Selected Location</h3><p style="margin: 4px 0 0 0; font-size: 12px;">Lat: ${selectedLocation.lat.toFixed(6)}<br/>Lng: ${selectedLocation.lng.toFixed(6)}</p></div>`,
        },
      ]
    : []

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter address or use location services"}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={handleAddressSearch} disabled={!value.trim()}>
          <Search className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          title="Use my current location"
        >
          <Crosshair className={`h-4 w-4 ${isGettingLocation ? "animate-spin" : ""}`} />
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowMap(!showMap)}>
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {showMap && (
        <Card>
          <CardContent className="p-4">
            <div className="mb-3">
              <p className="text-sm text-sky-700 font-medium mb-1">📍 Select Exact Location</p>
              <p className="text-xs text-gray-600">
                Click on the map to pinpoint the exact location of your bathing spot. The address will be automatically
                filled based on your selection.
              </p>
            </div>
            <div className="h-80 rounded-lg overflow-hidden border border-sky-200">
              <GoogleMap
                center={mapCenter}
                zoom={selectedLocation ? 15 : 12}
                markers={markers}
                onClick={handleMapClick}
                className="h-full"
              />
            </div>
            {selectedLocation && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium text-sm mb-1">✓ Location Selected</p>
                <div className="text-xs text-green-700 space-y-1">
                  <p>
                    <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-green-600">
                    <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

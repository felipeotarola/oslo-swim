"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Star, DollarSign, Utensils, Coffee, Beer, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getNearbyPlaces, getPhotoUrl, testGoogleMapsAPI, type PlaceResult } from "@/lib/google-maps-service"

interface NearbyPlacesProps {
  lat: number
  lng: number
  spotName: string
}

export function NearbyPlaces({ lat, lng, spotName }: NearbyPlacesProps) {
  const [restaurants, setRestaurants] = useState<PlaceResult[]>([])
  const [bars, setBars] = useState<PlaceResult[]>([])
  const [cafes, setCafes] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Test if API is available
        const apiAvailable = await testGoogleMapsAPI()
        if (!apiAvailable) {
          setError("Google Maps API is not available")
          return
        }

        const [restaurantResults, barResults, cafeResults] = await Promise.all([
          getNearbyPlaces(lat, lng, "restaurant", 1500),
          getNearbyPlaces(lat, lng, "bar", 1500),
          getNearbyPlaces(lat, lng, "cafe", 1500),
        ])

        setRestaurants(restaurantResults.slice(0, 6))
        setBars(barResults.slice(0, 6))
        setCafes(cafeResults.slice(0, 6))
      } catch (err) {
        console.error("Error fetching nearby places:", err)
        setError("Failed to load nearby places")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaces()
  }, [lat, lng])

  const renderPlaceCard = (place: PlaceResult) => (
    <Card key={place.place_id} className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32">
        {place.photos && place.photos.length > 0 ? (
          <Image
            src={getPhotoUrl(place.photos[0].photo_reference, 300) || "/placeholder.svg"}
            alt={place.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
            <Utensils className="h-8 w-8 text-sky-600" />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h4 className="font-medium text-sky-900 mb-1 line-clamp-1">{place.name}</h4>
        <p className="text-xs text-sky-600 mb-2 line-clamp-1">{place.vicinity}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.price_level && (
              <div className="flex items-center">
                {Array.from({ length: place.price_level }, (_, i) => (
                  <DollarSign key={i} className="h-3 w-3 text-green-600" />
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-6 px-2"
            onClick={() => {
              const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
              window.open(url, "_blank")
            }}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <Card className="bg-white border-sky-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-sky-800 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Near {spotName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-white border-sky-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-sky-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-sky-800 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Near {spotName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="restaurants" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              Food
            </TabsTrigger>
            <TabsTrigger value="bars" className="flex items-center gap-1">
              <Beer className="h-4 w-4" />
              Bars
            </TabsTrigger>
            <TabsTrigger value="cafes" className="flex items-center gap-1">
              <Coffee className="h-4 w-4" />
              Cafés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {restaurants.length > 0 ? (
                restaurants.map(renderPlaceCard)
              ) : (
                <p className="text-gray-600 col-span-2 text-center py-4">No restaurants found nearby</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bars" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bars.length > 0 ? (
                bars.map(renderPlaceCard)
              ) : (
                <p className="text-gray-600 col-span-2 text-center py-4">No bars found nearby</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cafes" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cafes.length > 0 ? (
                cafes.map(renderPlaceCard)
              ) : (
                <p className="text-gray-600 col-span-2 text-center py-4">No cafés found nearby</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Droplets,
  Heart,
  MapPin,
  Share,
  ThermometerIcon,
  Users,
  Beer,
  Sparkles,
} from "lucide-react"
import { bathingSpots } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { WeatherDisplay } from "@/components/weather-display"
import { WeatherForecast } from "@/components/weather-forecast"
import { BeachVibes } from "@/components/beach-vibes"
import { PartyLevel } from "@/components/party-level"
import { SunsetTimer } from "@/components/sunset-timer"
import { Directions } from "@/components/directions"
import { NearbyPlaces } from "@/components/nearby-places"
import { GoogleMap } from "@/components/google-map"
import { fetchCurrentWeather } from "@/lib/weather-service"

export default function SpotDetail({ params }: { params: { id: string } }) {
  const spot = bathingSpots.find((s) => s.id === params.id)
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)
  const [currentWeather, setCurrentWeather] = useState<{ temp: number; description: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user && spot) {
      const checkIfFavorite = async () => {
        try {
          setIsCheckingFavorite(true)
          const { data, error } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("spot_id", spot.id)

          if (error) {
            console.error("Error checking favorite status:", error)
            return
          }

          setIsFavorite(data && data.length > 0)
        } catch (error) {
          console.error("Error checking favorite status:", error)
        } finally {
          setIsCheckingFavorite(false)
        }
      }

      checkIfFavorite()
    }
  }, [user, spot])

  useEffect(() => {
    if (spot) {
      const getWeather = async () => {
        try {
          const weatherData = await fetchCurrentWeather(spot.coordinates.lat, spot.coordinates.lon)
          setCurrentWeather({
            temp: weatherData.main.temp,
            description: weatherData.weather[0].description,
          })
        } catch (error) {
          console.error("Error fetching weather:", error)
          setCurrentWeather({
            temp: spot.waterTemperature,
            description: "sunny",
          })
        }
      }

      getWeather()
    }
  }, [spot])

  if (!spot) {
    notFound()
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save favorites",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isFavorite) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("spot_id", spot.id)

        if (error) throw error

        setIsFavorite(false)
        toast({
          title: "Removed from favorites",
          description: `${spot.name} has been removed from your favorites`,
        })
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          spot_id: spot.id,
          spot_name: spot.name,
          water_temperature: spot.waterTemperature,
          created_at: new Date().toISOString(),
        })

        if (error) {
          if (error.code === "23505") {
            setIsFavorite(true)
            toast({
              title: "Already in favorites",
              description: `${spot.name} is already in your favorites`,
            })
          } else {
            throw error
          }
        } else {
          setIsFavorite(true)
          toast({
            title: "Added to favorites",
            description: `${spot.name} has been added to your favorites`,
          })
        }
      }
    } catch (error: any) {
      console.error("Error updating favorites:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Oslo Bathing Spots - ${spot.name}`,
          text: `Check out ${spot.name} - Current water temperature: ${spot.waterTemperature}°C`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error))
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      })
    }
  }

  const mapMarkers = [
    {
      position: { lat: spot.coordinates.lat, lng: spot.coordinates.lon },
      title: spot.name,
      info: `<div style="padding: 8px;"><h3 style="margin: 0; color: #0c4a6e;">${spot.name}</h3><p style="margin: 4px 0 0 0; font-size: 12px;">${spot.location}</p></div>`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all spots
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
              <Image src={spot.imageUrl || "/placeholder.svg"} alt={spot.name} fill className="object-cover" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-sky-900 mb-2">{spot.name}</h1>
            <div className="flex items-center text-sky-700 mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{spot.location}</span>
            </div>

            {/* Party Level and BYOB Info */}
            <div className="flex flex-wrap gap-3 mb-6">
              <PartyLevel level={spot.partyLevel} />
              {spot.byobFriendly && (
                <Badge className="bg-orange-500 flex items-center gap-1">
                  <Beer className="h-3 w-3" />
                  BYOB Friendly
                </Badge>
              )}
              {spot.sunsetViews && (
                <Badge className="bg-pink-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Sunset Views
                </Badge>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-sky-800">{spot.description}</p>
            </div>

            {/* Beach Vibes */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-sky-800 mb-4">Beach Vibes & Activities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {spot.vibes.map((vibe, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                    <span className="text-sm font-medium text-orange-800">{vibe}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-sky-800 mb-4">Location</h2>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <GoogleMap
                    center={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
                    zoom={15}
                    markers={mapMarkers}
                    className="h-[300px]"
                  />
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-semibold text-sky-800 mb-4">Facilities</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {spot.facilities.map((facility, index) => (
                <li key={index} className="flex items-center text-sky-700">
                  <span className="h-2 w-2 bg-sky-400 rounded-full mr-2"></span>
                  {facility}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-sky-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-sky-800 mb-4">Current Conditions</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
                    <div className="flex items-center">
                      <ThermometerIcon className="h-5 w-5 text-sky-700 mr-2" />
                      <span className="text-sky-800">Water Temperature</span>
                    </div>
                    <span className="text-xl font-bold text-sky-900">{spot.waterTemperature}°C</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 text-sky-700 mr-2" />
                      <span className="text-sky-800">Water Quality</span>
                    </div>
                    <span className="font-medium text-sky-900">{spot.waterQuality}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-sky-700 mr-2" />
                      <span className="text-sky-800">Last Updated</span>
                    </div>
                    <span className="text-sm text-sky-900">{spot.lastUpdated}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-sky-700 mr-2" />
                      <span className="text-sky-800">Crowd Level</span>
                    </div>
                    <span className="font-medium text-sky-900">{spot.crowdLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Directions
              destination={{ lat: spot.coordinates.lat, lng: spot.coordinates.lon }}
              destinationName={spot.name}
            />

            {spot.sunsetViews && (
              <SunsetTimer lat={spot.coordinates.lat} lon={spot.coordinates.lon} showSunset={spot.sunsetViews} />
            )}

            <WeatherDisplay lat={spot.coordinates.lat} lon={spot.coordinates.lon} spotName={spot.name} />

            <BeachVibes
              temperature={currentWeather?.temp || spot.waterTemperature}
              weather={currentWeather?.description || "sunny"}
              spotName={spot.name}
            />

            <WeatherForecast lat={spot.coordinates.lat} lon={spot.coordinates.lon} />

            <NearbyPlaces lat={spot.coordinates.lat} lng={spot.coordinates.lon} spotName={spot.name} />

            <div className="flex gap-3">
              <Button
                className={`w-full flex items-center justify-center gap-2 ${
                  isFavorite ? "bg-pink-600 hover:bg-pink-700" : "bg-sky-600 hover:bg-sky-700"
                }`}
                onClick={toggleFavorite}
                disabled={isLoading || isCheckingFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
                {isCheckingFavorite
                  ? "Checking..."
                  : isLoading
                    ? "Updating..."
                    : isFavorite
                      ? "Favorited"
                      : "Add to Favorites"}
              </Button>
              <Button
                variant="outline"
                className="w-full border-sky-600 text-sky-600 hover:bg-sky-100"
                onClick={handleShare}
              >
                <Share className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
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

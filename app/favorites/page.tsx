"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { bathingSpots } from "@/lib/data"

type FavoriteSpot = {
  id: string
  user_id: string
  spot_id: string
  spot_name: string
  water_temperature: number
  created_at: string
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchFavorites = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching favorites:", error)
        toast({
          title: "Error",
          description: "Failed to load favorites. Please try again.",
          variant: "destructive",
        })
        return
      }

      setFavorites(data || [])
    } catch (error) {
      console.error("Error fetching favorites:", error)
      toast({
        title: "Error",
        description: "Failed to load favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string, spotName: string) => {
    try {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

      if (error) {
        console.error("Error removing favorite:", error)
        toast({
          title: "Error",
          description: "Failed to remove from favorites. Please try again.",
          variant: "destructive",
        })
        return
      }

      setFavorites(favorites.filter((fav) => fav.id !== favoriteId))
      toast({
        title: "Removed from favorites",
        description: `${spotName} has been removed from your favorites`,
      })
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-sky-900 mb-6">My Favorite Spots</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-sky-800 mb-4">Please log in</h2>
              <p className="text-sky-600 mb-6">
                You need to be logged in to view and manage your favorite bathing spots.
              </p>
              <Button className="bg-sky-600 text-white hover:bg-sky-700">
                <Link href="/auth/login">Log In</Link>
              </Button>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-sky-800 mb-4">No favorites yet</h2>
              <p className="text-sky-600 mb-6">
                You haven't added any bathing spots to your favorites yet. Browse the spots and click "Add to Favorites"
                to save them here.
              </p>
              <Button className="bg-sky-600 hover:bg-sky-700">
                <Link href="/">Browse Bathing Spots</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const spotDetails = bathingSpots.find((s) => s.id === favorite.spot_id)
              return (
                <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src={spotDetails?.imageUrl || "/placeholder.svg"}
                      alt={favorite.spot_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-sky-800 mb-2">{favorite.spot_name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1 -mr-2"
                        onClick={() => removeFavorite(favorite.id, favorite.spot_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center text-sky-700 mb-3">
                      <span className="text-sm">Water temperature: {favorite.water_temperature}°C</span>
                    </div>
                    <div className="flex items-center text-sky-600 mb-3">
                      <span className="text-xs">Added: {new Date(favorite.created_at).toLocaleDateString()}</span>
                    </div>
                    <Button className="w-full bg-sky-600 hover:bg-sky-700" asChild>
                      <Link href={`/spot/${favorite.spot_id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Data updated every hour</p>
        </div>
      </footer>
    </div>
  )
}

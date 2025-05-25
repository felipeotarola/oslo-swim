"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Eye, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"

interface UserSpot {
  id: string
  title: string
  address: string
  description: string
  main_image_url: string
  status: "pending" | "approved" | "rejected"
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export default function MySpotsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [spots, setSpots] = useState<UserSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMySpots()
    }
  }, [user])

  const fetchMySpots = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("user_spots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching spots:", error)
        toast({
          title: "Error loading spots",
          description: "Failed to load your submitted spots. Please try again.",
          variant: "destructive",
        })
        throw error
      }

      setSpots(data || [])

      if (data && data.length > 0) {
        toast({
          title: "Spots loaded",
          description: `Found ${data.length} submitted spot(s)`,
        })
      }
    } catch (error) {
      console.error("Error fetching spots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
        <Header />
        <Toaster />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sky-700">Please log in to view your submitted spots.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-sky-900">My Submitted Spots</h1>
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/add-spot">
              <Plus className="h-4 w-4 mr-2" />
              Add New Spot
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              <span className="text-sky-700">Loading your spots...</span>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : spots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-sky-800 mb-4">No spots submitted yet</h2>
              <p className="text-sky-600 mb-6">Share your favorite hidden swimming spots with the Oslo community!</p>
              <Button asChild className="bg-sky-600 hover:bg-sky-700">
                <Link href="/add-spot">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Spot
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={spot.main_image_url || "/placeholder.svg"}
                    alt={spot.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">{getStatusBadge(spot.status)}</div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-sky-800 mb-2">{spot.title}</h3>
                  <p className="text-sm text-sky-600 mb-2">{spot.address}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{spot.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(spot.status)}
                    <span className="text-sm font-medium capitalize">{spot.status}</span>
                  </div>

                  {spot.status === "rejected" && spot.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                      <p className="text-sm text-red-700">
                        <strong>Rejection reason:</strong> {spot.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    Submitted: {new Date(spot.created_at).toLocaleDateString()}
                  </div>

                  {spot.status === "approved" && (
                    <Button asChild className="w-full bg-sky-600 hover:bg-sky-700" size="sm">
                      <Link href={`/community-spot/${spot.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Live Spot
                      </Link>
                    </Button>
                  )}

                  {/* Edit button for all spots */}
                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 mt-2" size="sm">
                    <Link href={`/edit-spot/community-${spot.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Spot
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Bringing good vibes to Oslo beaches 🌊🍻</p>
        </div>
      </footer>
    </div>
  )
}

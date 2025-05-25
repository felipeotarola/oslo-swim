import { supabase } from "@/lib/supabase"
import { bathingSpots, type BathingSpot } from "@/lib/data"

export interface CommunitySpot {
  id: string
  user_id: string
  title: string
  address: string
  description: string
  coordinates: { lat: number; lng: number }
  main_image_url: string
  additional_images: string[]
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  approved_at?: string
  // Additional fields to match BathingSpot interface
  waterTemperature?: number
  waterQuality?: "Excellent" | "Good" | "Fair" | "Poor"
  crowdLevel?: "Low" | "Moderate" | "High"
  partyLevel?: "Quiet" | "Chill" | "Party-Friendly"
  byobFriendly?: boolean
  sunsetViews?: boolean
  lastUpdated?: string
  facilities?: string[]
  vibes?: string[]
}

export interface UnifiedSpot extends BathingSpot {
  isCommunitySpot: boolean
  communitySpotId?: string
  submittedBy?: string
}

export async function getAllSpots(): Promise<UnifiedSpot[]> {
  try {
    // Fetch approved community spots
    const { data: communitySpots, error } = await supabase
      .from("user_spots")
      .select("*")
      .eq("status", "approved")
      .order("approved_at", { ascending: false })

    if (error) {
      console.error("Error fetching community spots:", error)
    }

    // Convert regular spots to unified format
    const regularSpots: UnifiedSpot[] = bathingSpots.map((spot) => ({
      ...spot,
      isCommunitySpot: false,
    }))

    // Convert community spots to unified format
    const convertedCommunitySpots: UnifiedSpot[] = (communitySpots || []).map((spot) => ({
      id: `community-${spot.id}`,
      name: spot.title,
      location: spot.address,
      description: spot.description,
      waterTemperature: spot.waterTemperature || 18, // Default value
      waterQuality: (spot.waterQuality as any) || "Good",
      crowdLevel: (spot.crowdLevel as any) || "Moderate",
      partyLevel: (spot.partyLevel as any) || "Chill",
      byobFriendly: spot.byobFriendly || false,
      sunsetViews: spot.sunsetViews || false,
      lastUpdated: new Date(spot.updated_at).toLocaleDateString(),
      imageUrl: spot.main_image_url,
      facilities: spot.facilities || ["Community Submitted"],
      coordinates: {
        lat: spot.coordinates.lat,
        lon: spot.coordinates.lng,
      },
      vibes: spot.vibes || ["Community Favorite", "Hidden Gem"],
      isCommunitySpot: true,
      communitySpotId: spot.id,
      submittedBy: spot.user_id,
    }))

    return [...regularSpots, ...convertedCommunitySpots]
  } catch (error) {
    console.error("Error in getAllSpots:", error)
    // Return regular spots as fallback
    return bathingSpots.map((spot) => ({
      ...spot,
      isCommunitySpot: false,
    }))
  }
}

export async function getCommunitySpotById(id: string): Promise<CommunitySpot | null> {
  try {
    const { data, error } = await supabase.from("user_spots").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching community spot:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getCommunitySpotById:", error)
    return null
  }
}

export async function updateCommunitySpot(id: string, updates: Partial<CommunitySpot>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_spots")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating community spot:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateCommunitySpot:", error)
    return false
  }
}

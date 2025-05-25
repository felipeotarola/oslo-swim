import { getFeaturedSpots } from "@/lib/featured-spots-service"
import { supabase } from "@/lib/supabase"

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
  water_temperature?: number
  water_quality?: "Excellent" | "Good" | "Fair" | "Poor"
  crowd_level?: "Low" | "Moderate" | "High"
  party_level?: "Quiet" | "Chill" | "Party-Friendly"
  byob_friendly?: boolean
  sunset_views?: boolean
  lastUpdated?: string
  facilities?: string[]
  vibes?: string[]
}

export interface UnifiedSpot {
  id: string
  name: string
  location: string
  description: string
  waterTemperature: number
  waterQuality: "Excellent" | "Good" | "Fair" | "Poor"
  crowdLevel: "Low" | "Moderate" | "High"
  partyLevel: "Quiet" | "Chill" | "Party-Friendly"
  byobFriendly: boolean
  sunsetViews: boolean
  lastUpdated: string
  imageUrl: string
  facilities: string[]
  coordinates: {
    lat: number
    lon: number
  }
  vibes: string[]
  isCommunitySpot: boolean
  communitySpotId?: string
  submittedBy?: string
  isFeaturedSpot: boolean
  featuredSpotId?: string
}

export async function getAllSpots(): Promise<UnifiedSpot[]> {
  try {
    // Fetch featured spots and approved community spots in parallel
    const [featuredSpots, communitySpots] = await Promise.all([getFeaturedSpots(), fetchApprovedCommunitySpots()])

    // Convert featured spots to unified format
    const convertedFeaturedSpots: UnifiedSpot[] = featuredSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      location: spot.location,
      description: spot.description,
      waterTemperature: spot.water_temperature,
      waterQuality: spot.water_quality,
      crowdLevel: spot.crowd_level,
      partyLevel: spot.party_level,
      byobFriendly: spot.byob_friendly,
      sunsetViews: spot.sunset_views,
      lastUpdated: spot.last_updated,
      imageUrl: spot.image_url,
      facilities: spot.facilities,
      coordinates: {
        lat: spot.coordinates.lat,
        lon: spot.coordinates.lon,
      },
      vibes: spot.vibes,
      isCommunitySpot: false,
      isFeaturedSpot: true,
      featuredSpotId: spot.id,
    }))

    // Convert community spots to unified format
    const convertedCommunitySpots: UnifiedSpot[] = (communitySpots || []).map((spot) => ({
      id: `community-${spot.id}`,
      name: spot.title,
      location: spot.address,
      description: spot.description,
      waterTemperature: spot.water_temperature || 18,
      waterQuality: (spot.water_quality as any) || "Good",
      crowdLevel: (spot.crowd_level as any) || "Moderate",
      partyLevel: (spot.party_level as any) || "Chill",
      byobFriendly: spot.byob_friendly || false,
      sunsetViews: spot.sunset_views || false,
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
      isFeaturedSpot: false,
    }))

    return [...convertedFeaturedSpots, ...convertedCommunitySpots]
  } catch (error) {
    console.error("Error in getAllSpots:", error)
    // Return empty array as fallback
    return []
  }
}

async function fetchApprovedCommunitySpots(): Promise<CommunitySpot[]> {
  try {
    const { data, error } = await supabase
      .from("user_spots")
      .select("*")
      .eq("status", "approved")
      .order("approved_at", { ascending: false })

    if (error) {
      console.error("Error fetching community spots:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in fetchApprovedCommunitySpots:", error)
    return []
  }
}

export async function getSpotById(id: string): Promise<UnifiedSpot | null> {
  try {
    // Check if it's a community spot
    if (id.startsWith("community-")) {
      const communityId = id.replace("community-", "")
      const { data, error } = await supabase.from("user_spots").select("*").eq("id", communityId).single()

      if (error || !data) return null

      return {
        id: `community-${data.id}`,
        name: data.title,
        location: data.address,
        description: data.description,
        waterTemperature: data.water_temperature || 18,
        waterQuality: (data.water_quality as any) || "Good",
        crowdLevel: (data.crowd_level as any) || "Moderate",
        partyLevel: (data.party_level as any) || "Chill",
        byobFriendly: data.byob_friendly || false,
        sunsetViews: data.sunset_views || false,
        lastUpdated: new Date(data.updated_at).toLocaleDateString(),
        imageUrl: data.main_image_url,
        facilities: data.facilities || ["Community Submitted"],
        coordinates: {
          lat: data.coordinates.lat,
          lon: data.coordinates.lng,
        },
        vibes: data.vibes || ["Community Favorite", "Hidden Gem"],
        isCommunitySpot: true,
        communitySpotId: data.id,
        submittedBy: data.user_id,
        isFeaturedSpot: false,
      }
    } else {
      // It's a featured spot
      const { data, error } = await supabase.from("featured_spots").select("*").eq("id", id).single()

      if (error || !data) return null

      return {
        id: data.id,
        name: data.name,
        location: data.location,
        description: data.description,
        waterTemperature: data.water_temperature,
        waterQuality: data.water_quality,
        crowdLevel: data.crowd_level,
        partyLevel: data.party_level,
        byobFriendly: data.byob_friendly,
        sunsetViews: data.sunset_views,
        lastUpdated: data.last_updated,
        imageUrl: data.image_url,
        facilities: data.facilities,
        coordinates: {
          lat: data.coordinates.lat,
          lon: data.coordinates.lon,
        },
        vibes: data.vibes,
        isCommunitySpot: false,
        isFeaturedSpot: true,
        featuredSpotId: data.id,
      }
    }
  } catch (error) {
    console.error("Error in getSpotById:", error)
    return null
  }
}

// Legacy function for backward compatibility
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

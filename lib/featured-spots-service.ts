import { supabase } from "@/lib/supabase"

export interface FeaturedSpot {
  id: string
  name: string
  location: string
  description: string
  coordinates: { lat: number; lon: number }
  image_url: string
  water_temperature: number
  water_quality: "Excellent" | "Good" | "Fair" | "Poor"
  crowd_level: "Low" | "Moderate" | "High"
  party_level: "Quiet" | "Chill" | "Party-Friendly"
  byob_friendly: boolean
  sunset_views: boolean
  last_updated: string
  facilities: string[]
  vibes: string[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getFeaturedSpots(): Promise<FeaturedSpot[]> {
  try {
    const { data, error } = await supabase
      .from("featured_spots")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching featured spots:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFeaturedSpots:", error)
    return []
  }
}

export async function getFeaturedSpotById(id: string): Promise<FeaturedSpot | null> {
  try {
    const { data, error } = await supabase
      .from("featured_spots")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching featured spot:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getFeaturedSpotById:", error)
    return null
  }
}

export async function updateFeaturedSpot(id: string, updates: Partial<FeaturedSpot>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("featured_spots")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating featured spot:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateFeaturedSpot:", error)
    return false
  }
}

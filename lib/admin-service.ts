import { supabase } from "@/lib/supabase"

export interface PendingSpot {
  id: string
  user_id: string
  title: string
  address: string
  description: string
  coordinates: { lat: number; lng: number }
  main_image_url: string
  additional_images: string[]
  status: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  submitter_name?: string
  submitter_image?: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: "approve_spot" | "reject_spot" | "edit_featured_spot" | "create_featured_spot"
  target_id: string
  target_type: "community_spot" | "featured_spot"
  details: any
  created_at: string
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return data?.is_admin || false
  } catch (error) {
    console.error("Error in isUserAdmin:", error)
    return false
  }
}

export async function getPendingSpots(): Promise<PendingSpot[]> {
  try {
    // First get the pending spots
    const { data: spotData, error: spotError } = await supabase
      .from("user_spots")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (spotError) {
      console.error("Error fetching pending spots:", spotError)
      return []
    }

    if (!spotData || spotData.length === 0) {
      return []
    }

    // Then get the submitter profiles for those spots
    const userIds = spotData.map((spot) => spot.user_id)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, profile_image_url")
      .in("id", userIds)

    if (profileError) {
      console.error("Error fetching profiles:", profileError)
      // Continue with spots but without profile data
    }

    // Create a map of user_id to profile data for quick lookup
    const profileMap = (profileData || []).reduce((map, profile) => {
      map[profile.id] = profile
      return map
    }, {})

    // Combine the spot data with profile data
    return spotData.map((spot) => ({
      ...spot,
      submitter_name: profileMap[spot.user_id]?.name || "Unknown User",
      submitter_image: profileMap[spot.user_id]?.profile_image_url || null,
    }))
  } catch (error) {
    console.error("Error in getPendingSpots:", error)
    return []
  }
}

export async function approveSpot(spotId: string, adminId: string): Promise<boolean> {
  try {
    console.log("Approving spot with parameters:", { spotId, adminId })

    // Direct update approach instead of using a function
    const { error: updateError } = await supabase
      .from("user_spots")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: adminId, // Supabase will handle UUID conversion
        updated_at: new Date().toISOString(),
      })
      .eq("id", spotId)

    if (updateError) {
      console.error("Error updating spot:", updateError)
      return false
    }

    // Log the admin action
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId, // Supabase will handle UUID conversion
      action_type: "approve_spot",
      target_id: spotId,
      target_type: "community_spot",
      details: { action: "approved" },
    })

    if (logError) {
      console.error("Error logging admin action:", logError)
      // Continue even if logging fails
    }

    console.log("Spot approved successfully")
    return true
  } catch (error) {
    console.error("Error in approveSpot:", error)
    return false
  }
}

export async function rejectSpot(spotId: string, adminId: string, reason: string): Promise<boolean> {
  try {
    console.log("Rejecting spot with parameters:", { spotId, adminId, reason })

    // Direct update approach instead of using a function
    const { error: updateError } = await supabase
      .from("user_spots")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", spotId)

    if (updateError) {
      console.error("Error updating spot:", updateError)
      return false
    }

    // Log the admin action
    const { error: logError } = await supabase.from("admin_actions").insert({
      admin_id: adminId, // Supabase will handle UUID conversion
      action_type: "reject_spot",
      target_id: spotId,
      target_type: "community_spot",
      details: { action: "rejected", reason },
    })

    if (logError) {
      console.error("Error logging admin action:", logError)
      // Continue even if logging fails
    }

    console.log("Spot rejected successfully")
    return true
  } catch (error) {
    console.error("Error in rejectSpot:", error)
    return false
  }
}

export async function getAdminActions(limit = 50): Promise<AdminAction[]> {
  try {
    const { data, error } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching admin actions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAdminActions:", error)
    return []
  }
}

export async function logAdminAction(
  adminId: string,
  actionType: AdminAction["action_type"],
  targetId: string,
  targetType: AdminAction["target_type"],
  details: any = {},
): Promise<boolean> {
  try {
    const { error } = await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action_type: actionType,
      target_id: targetId,
      target_type: targetType,
      details: details,
    })

    if (error) {
      console.error("Error logging admin action:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in logAdminAction:", error)
    return false
  }
}

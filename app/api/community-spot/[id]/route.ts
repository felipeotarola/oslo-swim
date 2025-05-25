import { type NextRequest, NextResponse } from "next/server"
import { getCommunitySpotById } from "@/lib/unified-spots-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Spot ID is required" }, { status: 400 })
    }

    const spot = await getCommunitySpotById(id)

    if (!spot) {
      return NextResponse.json({ error: "Spot not found" }, { status: 404 })
    }

    return NextResponse.json(spot)
  } catch (error) {
    console.error("Error fetching community spot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

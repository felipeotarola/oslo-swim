import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Create Supabase client for route handler
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }

    if (!session) {
      console.error("No session found")
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("Upload request from user:", userId)

    // Get form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `spot-${userId}-${Date.now()}.${fileExt}`

    console.log("Uploading file:", fileName)

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("Upload successful:", blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogIn, Heart, Map } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

export function Header() {
  const { user, isLoading } = useAuth()
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")

  useEffect(() => {
    if (user) {
      // Fetch user's profile image
      const fetchProfileImage = async () => {
        try {
          const { data, error } = await supabase.from("profiles").select("profile_image_url").eq("id", user.id).single()

          if (error && error.code !== "PGRST116") throw error
          if (data?.profile_image_url) {
            setProfileImageUrl(data.profile_image_url)
          }
        } catch (error) {
          console.error("Error fetching profile image:", error)
        }
      }

      fetchProfileImage()
    }
  }, [user])

  if (isLoading) {
    return (
      <header className="bg-sky-600 text-white p-4 md:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold">Oslo Bathing Spots</span>
          </Link>
          <div>Loading...</div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-sky-600 text-white p-4 md:p-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-bold">Oslo Bathing Spots</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/map" className="hidden md:flex items-center gap-2 hover:underline">
            <Map className="h-4 w-4" />
            Map
          </Link>

          {user ? (
            <>
              <Link href="/favorites" className="hidden md:flex items-center gap-2 hover:underline">
                <Heart className="h-4 w-4" />
                My Favorites
              </Link>
              <Link href="/profile" className="flex items-center gap-2">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl || "/placeholder.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden md:inline">Profile</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/favorites">
                <Button variant="ghost" className="bg-white text-sky-600 border-sky-600 hover:bg-sky-100">
                  <Heart className="h-4 w-4 mr-2" />
                  My Favorites
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="bg-sky-600 text-white border-white hover:bg-sky-700">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

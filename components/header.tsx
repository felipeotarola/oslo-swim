"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, LogIn, Heart, Map, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const { user, isLoading, signOut, refreshSession } = useAuth()
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
    } else {
      setProfileImageUrl("")
    }
  }, [user])

  // Refresh session periodically to catch auth state changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshSession()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isLoading, refreshSession])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
    return (
      <header className="bg-sky-600 text-white p-4 md:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold">Oslo Bathing Spots</span>
          </Link>
          <div className="animate-pulse">Loading...</div>
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
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 bg-gradient-to-br from-orange-50 via-yellow-50 to-sky-100"
              >
                <div className="mt-6 flex flex-col gap-4 text-sky-900">
                  <Link href="/map" className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Map
                  </Link>
                  {user ? (
                    <>
                      <Link href="/favorites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        My Favorites
                      </Link>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 justify-start text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/favorites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        My Favorites
                      </Link>
                      <Link href="/auth/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/map"
            className="hidden md:flex items-center gap-2 text-white hover:text-yellow-200"
          >
            <Map className="h-5 w-5" />
            Map
          </Link>

          {user ? (
            <>
              <Link
                href="/favorites"
                className="hidden md:flex items-center gap-2 text-white hover:text-yellow-200"
              >
                <Heart className="h-4 w-4" />
                My Favorites
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
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
                    <span className="hidden md:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center gap-2 md:hidden">
                      <Heart className="h-4 w-4" />
                      My Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/favorites">
                <Button variant="link" className="text-white hover:text-yellow-200">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only md:inline">My Favorites</span>
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="link" className="text-white hover:text-yellow-200">
                  <LogIn className="h-4 w-4" />
                  <span className="sr-only md:inline">Login</span>
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

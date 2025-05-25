"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogIn, Heart, Map, LogOut, Home, Waves, Settings, Info } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/favorites", label: "My Favorites", icon: Heart, authRequired: true },
  { href: "/about", label: "About", icon: Info },
]

export function Header() {
  const { user, isLoading, signOut } = useAuth()
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (user) {
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

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const closeSheet = () => setIsOpen(false)

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const filteredNavItems = navigationItems.filter((item) => !item.authRequired || (item.authRequired && user))

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-sky-600" />
            <span className="text-lg font-bold text-sky-600">Oslo Bathing Spots</span>
          </div>
          <div className="animate-pulse text-sm text-gray-500">Loading...</div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-sky-600" />
          <span className="text-lg font-bold text-sky-600">Oslo Bathing Spots</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-600 ${
                  isActivePath(item.href) ? "text-sky-600" : "text-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-sky-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-sky-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-32 truncate">{user.email}</span>
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
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-sky-600" />
                    <span className="font-semibold text-sky-600">Oslo Bathing Spots</span>
                  </div>
                </div>

                {/* User Section */}
                {user && (
                  <div className="py-4 border-b">
                    <div className="flex items-center gap-3">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-sky-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-sky-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Welcome back!</p>
                        <p className="text-xs text-gray-500 truncate max-w-48">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 py-4">
                  <div className="space-y-1">
                    {filteredNavItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeSheet}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActivePath(item.href)
                              ? "bg-sky-50 text-sky-600 border border-sky-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}

                    {user && (
                      <>
                        <Link
                          href="/profile"
                          onClick={closeSheet}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActivePath("/profile")
                              ? "bg-sky-50 text-sky-600 border border-sky-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <User className="h-5 w-5" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={closeSheet}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActivePath("/settings")
                              ? "bg-sky-50 text-sky-600 border border-sky-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </>
                    )}
                  </div>
                </nav>

                {/* Bottom Actions */}
                <div className="border-t pt-4">
                  {user ? (
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full" onClick={closeSheet}>
                        <Link href="/auth/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={closeSheet}>
                        <Link href="/auth/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

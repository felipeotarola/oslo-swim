"use client"

import Link from "next/link"
import { WavesIcon as WaveIcon, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-sky-600 text-white p-4 md:p-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <WaveIcon className="h-6 w-6" />
          <h1 className="text-xl md:text-2xl font-bold">Oslo Bathing Spots</h1>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" className="text-white hover:bg-sky-700" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" className="bg-sky-600 text-white border-white hover:bg-sky-700" asChild>
                <Link href="/favorites">My Favorites</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" className="bg-sky-600 text-white border-white hover:bg-sky-700" asChild>
              <Link href="/auth/login">
                <LogIn className="h-5 w-5 mr-2" />
                Log In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

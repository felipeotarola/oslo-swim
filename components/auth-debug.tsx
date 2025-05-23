"use client"

import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthDebug() {
  const { user, session, isLoading, refreshSession } = useAuth()

  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    console.log("Current session:", data.session)
    console.log("Session error:", error)
  }

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    console.log("Current user:", data.user)
    console.log("User error:", error)
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Auth Debug (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : "None"}
        </div>
        <div>
          <strong>Session:</strong> {session ? "Active" : "None"}
        </div>
        <div className="flex gap-2">
          <Button onClick={checkSession} size="sm">
            Check Session
          </Button>
          <Button onClick={checkUser} size="sm">
            Check User
          </Button>
          <Button onClick={refreshSession} size="sm">
            Refresh Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

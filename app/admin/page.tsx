"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { isUserAdmin, getPendingSpots, getAdminActions, type PendingSpot, type AdminAction } from "@/lib/admin-service"
import { SpotApprovalCard } from "@/components/spot-approval-card"

export default function AdminPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingSpots, setPendingSpots] = useState<PendingSpot[]>([])
  const [adminActions, setAdminActions] = useState<AdminAction[]>([])
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
  })

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const adminStatus = await isUserAdmin(user.id)
        setIsAdmin(adminStatus)

        if (adminStatus) {
          await loadAdminData()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        toast({
          title: "Error",
          description: "Failed to verify admin status",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, toast])

  const loadAdminData = async () => {
    try {
      const [spots, actions] = await Promise.all([getPendingSpots(), getAdminActions()])

      setPendingSpots(spots)
      setAdminActions(actions)

      // Calculate stats
      const today = new Date().toDateString()
      const todayActions = actions.filter((action) => new Date(action.created_at).toDateString() === today)

      setStats({
        pendingCount: spots.length,
        approvedToday: todayActions.filter((action) => action.action_type === "approve_spot").length,
        rejectedToday: todayActions.filter((action) => action.action_type === "reject_spot").length,
      })
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    }
  }

  const handleSpotAction = async () => {
    // Reload data after spot action
    await loadAdminData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sky-700">Please log in to access the admin panel.</p>
            <Button asChild className="mt-4">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-sky-600" />
          <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Spots</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                  <p className="text-3xl font-bold text-red-600">{stats.rejectedToday}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Spots ({stats.pendingCount})</TabsTrigger>
            <TabsTrigger value="featured">Featured Spots</TabsTrigger>
            <TabsTrigger value="actions">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Spots Awaiting Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSpots.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending spots to review at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingSpots.map((spot) => (
                      <SpotApprovalCard key={spot.id} spot={spot} onAction={handleSpotAction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Spots Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Featured Spots</h3>
                  <p className="text-gray-600 mb-4">Manage official Oslo bathing spots</p>
                  <Button asChild>
                    <Link href="/beaches">View All Featured Spots</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {adminActions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No actions yet</h3>
                    <p className="text-gray-600">Admin actions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {action.action_type === "approve_spot" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {action.action_type === "reject_spot" && <XCircle className="h-5 w-5 text-red-500" />}
                          <div>
                            <p className="font-medium">
                              {action.action_type === "approve_spot" && "Approved spot"}
                              {action.action_type === "reject_spot" && "Rejected spot"}
                            </p>
                            <p className="text-sm text-gray-600">{new Date(action.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{action.target_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Admin Dashboard 🛡️</p>
        </div>
      </footer>
    </div>
  )
}

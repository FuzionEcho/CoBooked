"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Users, Plane, Hotel, Map, LogOut, Shield, AlertTriangle } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    trips: 0,
    flights: 0,
    hotels: 0,
  })

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/admin/login")
          return
        }

        // Check if user has admin role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError || profileData?.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "You do not have administrator privileges.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)

        // Fetch basic stats
        const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        const { count: tripCount } = await supabase.from("trips").select("*", { count: "exact", head: true })

        setStats({
          users: userCount || 0,
          trips: tripCount || 0,
          flights: 24, // Mock data
          hotels: 18, // Mock data
        })
      } catch (error) {
        console.error("Error checking admin status:", error)
        toast({
          title: "Error",
          description: "Failed to verify admin privileges.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [supabase, router, toast])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Verifying admin access...</h2>
          <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Router will redirect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-red-600 mr-3" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.users}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Trips</p>
                <p className="text-3xl font-bold">{stats.trips}</p>
              </div>
              <Map className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flights Booked</p>
                <p className="text-3xl font-bold">{stats.flights}</p>
              </div>
              <Plane className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hotels Reserved</p>
                <p className="text-3xl font-bold">{stats.hotels}</p>
              </div>
              <Hotel className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    User management functionality is limited in this demo. In a production environment, you would see a
                    list of users with options to view details, edit permissions, or deactivate accounts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Trip Management</CardTitle>
              <CardDescription>Monitor and manage all trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Trip management functionality is limited in this demo. In a production environment, you would see a
                    list of all trips with options to view details, edit, or delete trips.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>Monitor flights, hotels, and activity bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Booking management functionality is limited in this demo. In a production environment, you would see
                    lists of flights, hotels, and activities with options to view details, edit, or cancel bookings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure system settings and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Demo Mode</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Settings functionality is limited in this demo. In a production environment, you would see options
                    to configure system settings, manage admin accounts, and set up permissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

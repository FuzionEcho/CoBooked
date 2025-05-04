"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Shield, AlertCircle } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, authenticate the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Increment failed attempts
        setAttempts((prev) => prev + 1)

        // If too many failed attempts, show a stronger warning
        if (attempts >= 3) {
          toast({
            title: "Access Denied",
            description: "Too many failed attempts. This incident will be logged.",
            variant: "destructive",
          })
          // In a real app, you would log this security incident
          setIsLoading(false)
          return
        }

        toast({
          title: "Authentication Failed",
          description: "Invalid admin credentials.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if the user has admin role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user?.id)
        .single()

      if (profileError || profileData?.role !== "admin") {
        // Sign out the user if they're not an admin
        await supabase.auth.signOut()

        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // If we get here, the user is authenticated and has admin role
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      })

      // Redirect to admin dashboard
      router.push("/admin")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-red-200 dark:border-red-900">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
          <CardDescription className="text-center">
            Enter your administrator credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attempts > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p>Invalid login attempt. Please check your credentials.</p>
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                  {attempts >= 3
                    ? "Multiple failed attempts detected. This activity is being logged."
                    : `Failed attempts: ${attempts}`}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 dark:border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 dark:border-gray-700"
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Admin Dashboard"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Return to main site
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

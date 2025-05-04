"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2 } from "lucide-react"

export default function CreateTripPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorDetails(null)

    try {
      // Validate input
      if (!name.trim()) {
        throw new Error("Trip name is required")
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`)
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a trip.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Generate a random 6-character join code
      const generateJoinCode = () => {
        // Generate a 5-character code with letters and numbers
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let code = ""
        for (let i = 0; i < 5; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
      }
      const joinCode = generateJoinCode()

      console.log("Creating trip with:", { name, description, owner_id: user.id, joinCode })

      // Create the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          name,
          description,
          owner_id: user.id,
          status: "planning",
          join_code: joinCode,
        })
        .select()

      if (tripError) {
        console.error("Trip creation error:", tripError)
        throw new Error(`Failed to create trip: ${tripError.message}`)
      }

      if (!trip || trip.length === 0) {
        throw new Error("Trip was created but no data was returned")
      }

      const tripId = trip[0].id

      // Add the creator as a member
      const { error: memberError } = await supabase.from("trip_members").insert({
        trip_id: tripId,
        user_id: user.id,
        role: "owner",
      })

      if (memberError) {
        console.error("Member creation error:", memberError)
        throw new Error(`Failed to add you as a trip member: ${memberError.message}`)
      }

      toast({
        title: "Success",
        description: "Your trip has been created successfully.",
      })

      router.push(`/trips/${tripId}`)
    } catch (error: any) {
      console.error("Error creating trip:", error)

      const errorMessage = error.message || "An unexpected error occurred while creating your trip."
      setErrorDetails(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Trip</CardTitle>
            <CardDescription>Start planning your next adventure with friends</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateTrip}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  placeholder="Summer Reunion 2023"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell your friends what this trip is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              {errorDetails && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <strong>Error details:</strong> {errorDetails}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Calendar, Users, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Trip {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
  start_date?: string | null
  end_date?: string | null
  selected_destination_id: string | null
  destination_name?: string
  member_count?: number
  is_owner?: boolean
}

export function TripsList({ userId, type = "all" }: { userId: string; type?: "all" | "upcoming" | "past" }) {
  const { supabase } = useSupabase()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      try {
        // Get trips where user is a member
        const { data: memberTrips, error: memberError } = await supabase
          .from("trip_members")
          .select("trip_id, role")
          .eq("user_id", userId)

        if (memberError) throw memberError

        if (!memberTrips || memberTrips.length === 0) {
          setTrips([])
          setLoading(false)
          return
        }

        const tripIds = memberTrips.map((trip) => trip.trip_id)
        const memberRoles = memberTrips.reduce(
          (acc, trip) => {
            acc[trip.trip_id] = trip.role
            return acc
          },
          {} as Record<string, string>,
        )

        // Get trip details
        const { data, error } = await supabase
          .from("trips")
          .select("*, trip_preferences(travel_dates)")
          .in("id", tripIds)

        if (error) throw error

        // Process trips with dates
        const processedTrips = (data || []).map((trip) => {
          // Find travel dates from preferences
          const travelDates =
            trip.trip_preferences && trip.trip_preferences.length > 0 ? trip.trip_preferences[0]?.travel_dates : null

          return {
            ...trip,
            start_date: travelDates && travelDates.length > 0 ? travelDates[0] : null,
            end_date: travelDates && travelDates.length > 1 ? travelDates[1] : null,
            is_owner: memberRoles[trip.id] === "owner",
          }
        })

        // Filter trips based on type
        const now = new Date()
        let filteredTrips = processedTrips

        if (type === "upcoming") {
          filteredTrips = processedTrips.filter((trip) => {
            // If no end date, consider it upcoming if status is not completed
            if (!trip.end_date) return trip.status !== "completed"
            // Otherwise check if end date is in the future
            return new Date(trip.end_date) >= now || trip.status === "planning" || trip.status === "active"
          })
        } else if (type === "past") {
          filteredTrips = processedTrips.filter((trip) => {
            // If no end date, consider it past if status is completed
            if (!trip.end_date) return trip.status === "completed"
            // Otherwise check if end date is in the past
            return new Date(trip.end_date) < now && trip.status !== "planning" && trip.status !== "active"
          })
        }

        // Enhance trip data with destination info and member count
        const enhancedTrips = await Promise.all(
          filteredTrips.map(async (trip) => {
            // Get destination name if selected
            let destinationName = "Not selected yet"
            if (trip.selected_destination_id) {
              const { data: destData } = await supabase
                .from("destinations")
                .select("name")
                .eq("id", trip.selected_destination_id)
                .single()

              if (destData) {
                destinationName = destData.name
              }
            }

            // Get member count
            const { count } = await supabase
              .from("trip_members")
              .select("*", { count: "exact", head: true })
              .eq("trip_id", trip.id)

            return {
              ...trip,
              destination_name: destinationName,
              member_count: count || 0,
            }
          }),
        )

        setTrips(enhancedTrips)
      } catch (error) {
        console.error("Error fetching trips:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [supabase, userId, type])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-10 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">
          {type === "upcoming" ? "No upcoming trips found" : type === "past" ? "No past trips found" : "No trips found"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {type === "upcoming"
            ? "You haven't created or joined any upcoming trips yet."
            : type === "past"
              ? "You haven't completed any trips yet."
              : "You haven't created or joined any trips yet."}
        </p>
        {type !== "past" && (
          <Button asChild>
            <Link href="/trips/book">{type === "upcoming" ? "Plan Your Next Adventure" : "Book Your First Trip"}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <Card key={trip.id} className="overflow-hidden">
          <div className="h-40 bg-muted relative">
            <img
              src={`/placeholder.svg?key=kvq78&key=rd98g&key=dpnqg&height=160&width=400&query=travel destination ${trip.destination_name}`}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge
                variant={trip.status === "planning" ? "outline" : trip.status === "active" ? "default" : "secondary"}
              >
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </Badge>
              {!trip.is_owner && (
                <Badge variant="outline" className="bg-white/80">
                  Joined
                </Badge>
              )}
            </div>
          </div>
          <CardHeader>
            <CardTitle>{trip.name}</CardTitle>
            <CardDescription>{trip.description || "No description provided"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{trip.destination_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {trip.start_date && trip.end_date
                    ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                    : `Created ${new Date(trip.created_at).toLocaleDateString()}`}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{trip.member_count} members</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/trips/${trip.id}`}>View Trip</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

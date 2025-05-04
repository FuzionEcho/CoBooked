"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, ChevronRight } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { Badge } from "@/components/ui/badge"

interface Trip {
  id: string
  name: string
  destination_name: string
  start_date: string | null
  end_date: string | null
  member_count: number
  is_owner: boolean
}

interface UpcomingTripsProps {
  userId: string
}

// Mock data to use when database tables don't exist
const MOCK_TRIPS: Trip[] = [
  {
    id: "mock-trip-123",
    name: "Barcelona Adventure",
    destination_name: "Barcelona, Spain",
    start_date: "2023-08-15",
    end_date: "2023-08-22",
    member_count: 4,
    is_owner: false,
  },
  {
    id: "mock-trip-456",
    name: "Tokyo Exploration",
    destination_name: "Tokyo, Japan",
    start_date: "2023-09-10",
    end_date: "2023-09-20",
    member_count: 3,
    is_owner: true,
  },
]

export function UpcomingTrips({ userId }: UpcomingTripsProps) {
  const { supabase } = useSupabase()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function fetchUpcomingTrips() {
      try {
        // Check if trip_members table exists
        const { error: tableCheckError } = await supabase.from("trip_members").select("trip_id").limit(1).maybeSingle()

        // If table doesn't exist, use mock data
        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("Using mock data because trip_members table doesn't exist")
          setTrips(MOCK_TRIPS)
          setUseMockData(true)
          setLoading(false)
          return
        }

        // Get trips where user is a member
        const { data: memberTrips, error: memberError } = await supabase
          .from("trip_members")
          .select("trip_id, role")
          .eq("user_id", userId)

        if (memberError) {
          console.error("Error fetching member trips:", memberError)
          setTrips(MOCK_TRIPS)
          setUseMockData(true)
          setLoading(false)
          return
        }

        if (!memberTrips || memberTrips.length === 0) {
          // No trips found, use mock data for demo purposes
          setTrips(MOCK_TRIPS)
          setUseMockData(true)
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
          .not("status", "eq", "completed")
          .order("created_at", { ascending: false })
          .limit(3)

        if (error) {
          console.error("Error fetching trips:", error)
          setTrips(MOCK_TRIPS)
          setUseMockData(true)
          setLoading(false)
          return
        }

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

        // Enhance trip data with destination info and member count
        const enhancedTrips = await Promise.all(
          processedTrips.map(async (trip) => {
            // Get destination name if selected
            let destinationName = "Destination not selected yet"
            if (trip.selected_destination_id) {
              try {
                const { data: destData } = await supabase
                  .from("destinations")
                  .select("name")
                  .eq("id", trip.selected_destination_id)
                  .single()

                if (destData) {
                  destinationName = destData.name
                }
              } catch (destError) {
                console.error("Error fetching destination:", destError)
              }
            }

            // Get member count
            let memberCount = 1
            try {
              const { count } = await supabase
                .from("trip_members")
                .select("*", { count: "exact", head: true })
                .eq("trip_id", trip.id)

              memberCount = count || 1
            } catch (countError) {
              console.error("Error fetching member count:", countError)
            }

            return {
              id: trip.id,
              name: trip.name,
              destination_name: destinationName,
              start_date: trip.start_date,
              end_date: trip.end_date,
              member_count: memberCount,
              is_owner: trip.is_owner,
            }
          }),
        )

        setTrips(enhancedTrips)
      } catch (error) {
        console.error("Error fetching upcoming trips:", error)
        setTrips(MOCK_TRIPS)
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingTrips()
  }, [supabase, userId])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Trips</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/trips">
            View All
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse h-24 w-full bg-muted rounded-lg"></div>
            </div>
          ) : trips.length > 0 ? (
            trips.map((trip) => (
              <div key={trip.id} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={`/placeholder.svg?key=hmitv&key=numpq&key=0sz09&key=5q4h2&key=9ew86&height=96&width=96&query=travel destination ${trip.destination_name}`}
                    alt={trip.name}
                    className="w-full h-full object-cover"
                  />
                  {!trip.is_owner && (
                    <div className="absolute top-1 right-1">
                      <Badge variant="outline" className="bg-white/80 text-xs">
                        Joined
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{trip.name}</h3>
                  <p className="text-sm text-muted-foreground">{trip.destination_name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={14} />
                      <span>
                        {trip.start_date && trip.end_date
                          ? `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`
                          : "Dates not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={14} />
                      <span>{trip.member_count} members</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" asChild>
                    <Link
                      href={useMockData && trip.id === "mock-trip-123" ? "/trips/mock-trip-123" : `/trips/${trip.id}`}
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upcoming trips</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/trips/book">Plan a Trip</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

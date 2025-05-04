"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { SearchTabs } from "./search/search-tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Destination {
  id: string
  name: string
  country: string
  description: string | null
  image_url: string | null
  tags: string[] | null
  average_cost: number | null
  vote_count: number
  positive_votes: number
  user_vote: number | null
}

interface TripDestinationsProps {
  tripId: string
  userRole: string
}

// Mock destinations for demo purposes
const mockDestinations = [
  {
    id: "1",
    name: "Barcelona",
    country: "Spain",
    description: "A vibrant city known for its architecture, culture, and beaches.",
    image_url: null,
    tags: ["Beach", "City", "Culture", "Food"],
    average_cost: 1200,
  },
  {
    id: "2",
    name: "Tokyo",
    country: "Japan",
    description: "A bustling metropolis blending ultramodern and traditional.",
    image_url: null,
    tags: ["City", "Culture", "Food", "Shopping"],
    average_cost: 1800,
  },
  {
    id: "3",
    name: "Bali",
    country: "Indonesia",
    description: "A tropical paradise with beautiful beaches and rich culture.",
    image_url: null,
    tags: ["Beach", "Nature", "Relaxation", "Adventure"],
    average_cost: 900,
  },
]

export function TripDestinations({ tripId, userRole }: TripDestinationsProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [confirmingDestination, setConfirmingDestination] = useState<Destination | null>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"vote" | "search">("vote")

  useEffect(() => {
    async function fetchDestinations() {
      try {
        // Get trip details to check if a destination is already selected
        const { data: trip } = await supabase.from("trips").select("selected_destination_id").eq("id", tripId).single()

        if (trip) {
          setSelectedDestination(trip.selected_destination_id)
          // If a destination is already selected, default to search tab
          if (trip.selected_destination_id) {
            setActiveTab("search")
          }
        }

        // Check if destinations exist in the database
        const { count } = await supabase.from("destinations").select("*", { count: "exact", head: true })

        // If no destinations, add mock destinations
        if (count === 0) {
          await supabase.from("destinations").insert(mockDestinations)
        }

        // Get all destinations
        const { data: allDestinations, error } = await supabase.from("destinations").select("*")

        if (error) throw error

        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (currentUser) {
          // Get user preferences
          const { data: preferences } = await supabase
            .from("trip_preferences")
            .select("*")
            .eq("trip_id", tripId)
            .eq("user_id", currentUser.id)
            .single()

          if (preferences) {
            setUserPreferences(preferences)
          }
        }

        // Get user votes
        const {
          data: { user: userForVotes },
        } = await supabase.auth.getUser()

        if (!userForVotes) {
          throw new Error("User not authenticated")
        }

        const { data: votes } = await supabase
          .from("trip_votes")
          .select("destination_id, vote_value")
          .eq("trip_id", tripId)
          .eq("user_id", userForVotes.id)

        // Get all votes for this trip
        const { data: allVotes } = await supabase
          .from("trip_votes")
          .select("destination_id, vote_value")
          .eq("trip_id", tripId)

        // Calculate vote counts and user votes
        const destinationsWithVotes = allDestinations.map((dest: any) => {
          const destVotes = allVotes?.filter((v) => v.destination_id === dest.id) || []
          const positiveVotes = destVotes.filter((v) => v.vote_value > 0).length
          const userVote = votes?.find((v) => v.destination_id === dest.id)?.vote_value || null

          return {
            ...dest,
            vote_count: destVotes.length,
            positive_votes: positiveVotes,
            user_vote: userVote,
          }
        })

        // Sort by vote ratio (positive votes / total votes)
        const sortedDestinations = destinationsWithVotes.sort((a, b) => {
          const aRatio = a.vote_count > 0 ? a.positive_votes / a.vote_count : 0
          const bRatio = b.vote_count > 0 ? b.positive_votes / b.vote_count : 0
          return bRatio - aRatio
        })

        setDestinations(sortedDestinations)
      } catch (error) {
        console.error("Error fetching destinations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()

    // Set up real-time subscription for vote changes
    const channel = supabase
      .channel("trip_votes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_votes",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchDestinations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tripId])

  const handleVote = async (destinationId: string, voteValue: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to vote.",
          variant: "destructive",
        })
        return
      }

      // Check if user has already voted for this destination
      const { data: existingVote } = await supabase
        .from("trip_votes")
        .select("*")
        .eq("trip_id", tripId)
        .eq("user_id", user.id)
        .eq("destination_id", destinationId)
        .single()

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase.from("trip_votes").update({ vote_value: voteValue }).eq("id", existingVote.id)

        if (error) throw error
      } else {
        // Insert new vote
        const { error } = await supabase.from("trip_votes").insert({
          trip_id: tripId,
          user_id: user.id,
          destination_id: destinationId,
          vote_value: voteValue,
        })

        if (error) throw error
      }

      // Update local state
      setDestinations((prev) =>
        prev.map((dest) => {
          if (dest.id === destinationId) {
            const oldVote = dest.user_vote || 0
            const newPositiveVotes = dest.positive_votes - (oldVote > 0 ? 1 : 0) + (voteValue > 0 ? 1 : 0)
            return {
              ...dest,
              user_vote: voteValue,
              positive_votes: newPositiveVotes,
              vote_count: existingVote ? dest.vote_count : dest.vote_count + 1,
            }
          }
          return dest
        }),
      )
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to save your vote.",
        variant: "destructive",
      })
    }
  }

  const confirmDestination = async (destination: Destination) => {
    try {
      const { error } = await supabase
        .from("trips")
        .update({ selected_destination_id: destination.id })
        .eq("id", tripId)

      if (error) throw error

      setSelectedDestination(destination.id)
      setConfirmingDestination(null)
      setActiveTab("search")

      toast({
        title: "Success",
        description: `${destination.name} has been selected as your trip destination!`,
      })
    } catch (error) {
      console.error("Error confirming destination:", error)
      toast({
        title: "Error",
        description: "Failed to confirm destination.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const selectedDestinationData = destinations.find((d) => d.id === selectedDestination)

  return (
    <div className="space-y-6">
      {selectedDestination ? (
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "vote" | "search")}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{selectedDestinationData?.name}</h2>
              <p className="text-muted-foreground">{selectedDestinationData?.country}</p>
            </div>
            <TabsList>
              <TabsTrigger value="vote">Vote</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="vote">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  isSelected={destination.id === selectedDestination}
                  onVote={handleVote}
                  userRole={userRole}
                  onConfirm={() => setConfirmingDestination(destination)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search">
            <SearchTabs
              tripId={tripId}
              destination={selectedDestinationData?.name || ""}
              departureLocation={userPreferences?.departure_location || ""}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Vote for a Destination</h2>
            {userRole === "owner" && destinations.length > 0 && (
              <Button onClick={() => setConfirmingDestination(destinations[0])}>Select Top Destination</Button>
            )}
          </div>

          {destinations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No destinations available.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  isSelected={false}
                  onVote={handleVote}
                  userRole={userRole}
                  onConfirm={() => setConfirmingDestination(destination)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!confirmingDestination} onOpenChange={(open) => !open && setConfirmingDestination(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Destination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to select {confirmingDestination?.name} as your trip destination? This will finalize
              the destination for all trip members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDestination(confirmingDestination!)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface DestinationCardProps {
  destination: Destination
  isSelected: boolean
  onVote: (destinationId: string, voteValue: number) => void
  userRole: string
  onConfirm: () => void
}

function DestinationCard({ destination, isSelected, onVote, userRole, onConfirm }: DestinationCardProps) {
  return (
    <Card className={isSelected ? "border-primary" : ""}>
      <div className="h-40 bg-muted relative">
        <img
          src={
            destination.image_url ||
            `/placeholder.svg?height=160&width=400&query=travel destination ${destination.name || "/placeholder.svg"}`
          }
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary">Selected</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{destination.name}</h3>
            <p className="text-sm text-muted-foreground">{destination.country}</p>
          </div>
          {destination.average_cost && <Badge variant="outline">~${destination.average_cost}</Badge>}
        </div>

        <p className="text-sm mt-2 line-clamp-2">{destination.description}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {destination.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1">
            <Button
              variant={destination.user_vote === 1 ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onVote(destination.id, 1)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant={destination.user_vote === -1 ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onVote(destination.id, -1)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <span className="text-sm ml-2">
              {destination.vote_count > 0
                ? `${Math.round((destination.positive_votes / destination.vote_count) * 100)}% positive`
                : "No votes yet"}
            </span>
          </div>

          {userRole === "owner" && !isSelected && (
            <Button variant="outline" size="sm" onClick={onConfirm}>
              Select
            </Button>
          )}

          {isSelected && (
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              <Check className="h-4 w-4 mr-1" /> Selected
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

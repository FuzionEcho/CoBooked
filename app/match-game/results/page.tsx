"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { destinations, generateMockFlightData, type FlightData, type Destination } from "@/lib/match-game-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Calendar, DollarSign, Clock, Users, Share2, Star, Loader2 } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"

interface MatchResult {
  destination: Destination
  flightData: FlightData[]
  ranking: number
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const { supabase } = useSupabase()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the swiped destinations from the URL
    const gameId = searchParams.get("gameId")
    const swipedDestinationsParam = searchParams.get("destinations")

    if (!gameId || !swipedDestinationsParam) {
      router.push("/match-game")
      return
    }

    // Only process the results if we're still in the loading state
    // This prevents repeated processing on every render
    if (isLoading) {
      try {
        const swipedDestinations = JSON.parse(swipedDestinationsParam)

        // Get the destinations that were swiped right (liked)
        const likedDestinationIds = Object.entries(swipedDestinations)
          .filter(([_, liked]) => liked === true) // Explicitly check for true
          .map(([id]) => id)

        console.log("Liked destination IDs:", likedDestinationIds)

        if (likedDestinationIds.length === 0) {
          setError("You didn't like any destinations. Try playing again!")
          setIsLoading(false)
          return
        }

        // Get the matched destinations with flight data
        const matches = likedDestinationIds
          .map((id) => {
            const destination = destinations.find((d) => d.id === id)
            if (!destination) return null

            return {
              destination,
              flightData: generateMockFlightData(id),
              ranking: 3, // Default ranking (1-5 scale)
            }
          })
          .filter(Boolean) as MatchResult[]

        setMatchResults(matches)
        setIsLoading(false)
      } catch (error) {
        console.error("Error parsing match results:", error)
        setError("Something went wrong. Please try again.")
        setIsLoading(false)
      }
    }
  }, [searchParams, router, isLoading])

  const handleRankingChange = (destinationId: string, ranking: number) => {
    setMatchResults((prev) =>
      prev.map((result) => (result.destination.id === destinationId ? { ...result, ranking } : result)),
    )
  }

  const handleCreateTripWithRankings = async () => {
    setIsCreatingTrip(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/match-game/results")
        return
      }

      // Generate a random join code
      const generateJoinCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let code = ""
        for (let i = 0; i < 5; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
      }
      const joinCode = generateJoinCode()

      // Sort destinations by ranking (highest first)
      const sortedResults = [...matchResults].sort((a, b) => b.ranking - a.ranking)

      // Get destination names for trip name and preferences
      const sortedDestinations = sortedResults.map((result) => result.destination.name)

      // Create trip name based on top destination
      const tripName = sortedDestinations.length > 0 ? `Trip to ${sortedDestinations[0]}` : "My Matched Trip"

      // Create the trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          name: tripName,
          description: `Trip based on match game results: ${sortedDestinations.join(", ")}`,
          owner_id: user.id,
          status: "planning",
          join_code: joinCode,
        })
        .select()

      if (tripError) {
        throw new Error(`Failed to create trip: ${tripError.message}`)
      }

      if (!trip || trip.length === 0) {
        throw new Error("Trip was created but no data was returned")
      }

      const tripId = trip[0].id

      // Add the creator as a member
      await supabase.from("trip_members").insert({
        trip_id: tripId,
        user_id: user.id,
        role: "owner",
      })

      // Store destination preferences in trip_preferences
      const destinationPrefs = sortedDestinations.join(", ")
      await supabase.from("trip_preferences").insert({
        trip_id: tripId,
        preferences: {
          destinations: destinationPrefs,
          // Store the full ranked destinations with more details
          rankedDestinations: sortedResults.map((result) => ({
            id: result.destination.id,
            name: result.destination.name,
            country: result.destination.country,
            ranking: result.ranking,
            iataCode: result.destination.iataCode,
          })),
        },
      })

      router.push(`/trips/${tripId}`)
    } catch (error) {
      console.error("Error creating trip:", error)
      alert("Failed to create trip. Please try again.")
    } finally {
      setIsCreatingTrip(false)
    }
  }

  const handleSearchFlights = (destination: string) => {
    // Set default dates
    const today = new Date()
    const twoWeeksLater = new Date()
    twoWeeksLater.setDate(today.getDate() + 14)

    // Format dates as YYYY-MM-DD
    const departureDate = today.toISOString().split("T")[0]
    const returnDate = twoWeeksLater.toISOString().split("T")[0]

    // Redirect to flights page with pre-filled parameters
    router.push(
      `/flights?destination=${encodeURIComponent(destination)}&departureDate=${departureDate}&returnDate=${returnDate}&passengers=1&cabinClass=economy`,
    )
  }

  const handlePlayAgain = () => {
    router.push("/match-game")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Finding your matches...</h1>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Oops!</h2>
                <p className="mb-6">{error}</p>
                <Button onClick={handlePlayAgain}>Play Again</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Oops!</h2>
                <p className="mb-6">{error}</p>
                <Button onClick={handlePlayAgain}>Play Again</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Top Destination Matches</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Based on your swipes, here are your top destination matches with flight options.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Rank your favorites to create a personalized trip!</p>
          </div>

          {matchResults.length === 0 ? (
            <Card className="mb-8">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-4">No matches found</h2>
                <p className="mb-6">You didn't swipe right on any destinations. Try playing again!</p>
                <Button onClick={handlePlayAgain}>Play Again</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8">
              {matchResults.map((result, index) => (
                <Card key={result.destination.id} className="overflow-hidden">
                  <div className="relative h-48 sm:h-64">
                    <img
                      src={result.destination.imageUrl || "/placeholder.svg"}
                      alt={result.destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h2 className="text-2xl font-bold">{result.destination.name}</h2>
                      <p className="text-lg">{result.destination.country}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-white">Match #{index + 1}</Badge>
                    </div>
                  </div>

                  <CardContent className="pt-6">
                    <p className="mb-4">{result.destination.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Best Time</p>
                          <p className="text-sm">{result.destination.bestTimeToVisit.split(",")[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Daily Cost</p>
                          <p className="text-sm">${result.destination.averagePrice}/day</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Flight Time</p>
                          <p className="text-sm">{result.destination.flightTime.split(" from")[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Ideal For</p>
                          <p className="text-sm">{result.destination.tags.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary" />
                        Your Ranking
                      </p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRankingChange(result.destination.id, rating)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              result.ranking >= rating
                                ? "bg-primary text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                            aria-label={`Rate ${rating} stars`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Flight Options</h3>

                    <div className="space-y-4">
                      {result.flightData.map((flight, flightIndex) => (
                        <div
                          key={flightIndex}
                          className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{flight.airline}</div>
                            <div className="text-lg font-bold">${flight.price}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <div>{flight.departureTime}</div>
                                <div>{flight.arrivalTime}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-primary" />
                              <div className="text-sm">
                                <div>{flight.duration}</div>
                                <div>
                                  {flight.stops === 0
                                    ? "Nonstop"
                                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSearchFlights(result.destination.iataCode || result.destination.name)
                                }
                              >
                                Book This Flight
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/car-hire?location=${encodeURIComponent(result.destination.name)}`)
                                }
                              >
                                Find Car Rental
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">Flights to Your Matched Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.length > 0 &&
                matchResults.map((result, index) => {
                  // Pre-calculate the random price to avoid regenerating on every render
                  const randomPrice = 200 + Math.floor(Math.random() * 300)

                  return (
                    <Card key={`flight-deal-${index}`} className="overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={
                            result.destination.imageUrl ||
                            `/placeholder.svg?height=200&width=400&query=${result.destination.name || "/placeholder.svg"}`
                          }
                          alt={result.destination.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <h3 className="text-xl font-bold">{result.destination.name}</h3>
                          <p className="text-sm opacity-90">{result.destination.country}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Best Flight Deal</p>
                            <p className="text-2xl font-bold">${result.flightData[0]?.price || randomPrice}</p>
                          </div>
                          <Button
                            onClick={() => handleSearchFlights(result.destination.iataCode || result.destination.name)}
                          >
                            <Plane className="h-4 w-4 mr-1" />
                            Book Flight
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Explore {result.destination.name} based on your preferences! Click to see available flights.
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              onClick={handleCreateTripWithRankings}
              className="flex items-center gap-2"
              disabled={isCreatingTrip}
            >
              {isCreatingTrip ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4" />
                  Create Trip with These Destinations
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handlePlayAgain} className="flex items-center gap-2">
              Play Again
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

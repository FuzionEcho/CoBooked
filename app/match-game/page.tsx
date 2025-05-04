"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Heart, Loader2 } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { v4 as uuidv4 } from "uuid"
import { getRandomDestinations, type Destination } from "@/lib/match-game-data"

function DestinationCard({
  destination,
  onSwipe,
}: {
  destination: Destination
  onSwipe: (direction: "left" | "right") => void
}) {
  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg">
      <img
        src={destination.imageUrl || "/placeholder.svg"}
        alt={destination.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="text-xl font-bold">{destination.name}</h3>
        <p className="text-sm opacity-90">{destination.country}</p>
        <p className="mt-2">{destination.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {destination.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500 hover:text-white"
          onClick={() => onSwipe("left")}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-green-500 hover:text-white"
          onClick={() => onSwipe("right")}
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default function MatchGamePage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedDestinations, setSwipedDestinations] = useState<{ [key: string]: boolean }>({})
  const [gameId, setGameId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [gameDestinations, setGameDestinations] = useState<Destination[]>([])

  // Generate a unique game ID and load destinations on component mount
  useEffect(() => {
    setGameId(uuidv4())

    // Get random destinations for this game session
    const randomDests = getRandomDestinations(10)
    setGameDestinations(randomDests)
    setIsLoading(false)

    // Initialize swipedDestinations with all destinations set to false (not swiped)
    const initialSwiped: { [key: string]: boolean } = {}
    randomDests.forEach((dest) => {
      initialSwiped[dest.id] = false
    })
    setSwipedDestinations(initialSwiped)
  }, [])

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= gameDestinations.length) return

    // Update the swiped state for the current destination
    setSwipedDestinations((prev) => ({
      ...prev,
      [gameDestinations[currentIndex].id]: direction === "right",
    }))

    // Move to the next card
    if (currentIndex < gameDestinations.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // All cards have been swiped
      finishSwiping()
    }
  }

  const finishSwiping = async () => {
    try {
      // Check if we have any right swipes (likes)
      const hasLikes = Object.values(swipedDestinations).some((value) => value === true)

      if (!hasLikes) {
        // If no destinations were liked, show a message
        alert("You didn't like any destinations. Try again with different preferences!")
        router.push("/flights") // Redirect to flights page
        return
      }

      // Navigate to results page with the swiped destinations
      router.push(`/match-game/results?gameId=${gameId}&destinations=${JSON.stringify(swipedDestinations)}`)
    } catch (error) {
      console.error("Error saving match game results:", error)
    }
  }

  const progress = Math.min(100, (currentIndex / gameDestinations.length) * 100)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading destinations...</h1>
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Destination Match Game</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto text-center">
            Swipe right on destinations you like and left on ones you don't. After matching, you'll be able to rank your
            favorites and create a trip based on your preferences!
          </p>

          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center mt-2">
              {currentIndex} of {gameDestinations.length} destinations
            </p>
          </div>

          <div className="relative h-[500px] mb-6">
            {currentIndex < gameDestinations.length ? (
              <DestinationCard destination={gameDestinations[currentIndex]} onSwipe={handleSwipe} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">All done!</h2>
                <p className="mb-6">You've swiped through all destinations. Check out your matches!</p>
                <Button onClick={finishSwiping}>See Results</Button>
              </div>
            )}
          </div>

          {currentIndex < gameDestinations.length && (
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => handleSwipe("left")}
              >
                <X className="h-8 w-8" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => handleSwipe("right")}
              >
                <Heart className="h-8 w-8" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

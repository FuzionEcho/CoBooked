import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { EnhancedFlightSearch } from "@/components/enhanced-flight-search"

export default async function TripFlightsPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  const supabase = createServerSupabaseClient()

  if (!session) {
    redirect("/login")
  }

  // Check if user is a member of this trip
  const { data: memberData } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!memberData) {
    redirect("/trips")
  }

  // Get trip details
  const { data: trip } = await supabase.from("trips").select("*, destinations(name)").eq("id", params.id).single()

  if (!trip) {
    redirect("/trips")
  }

  // Get user preferences for departure location
  const { data: preferences } = await supabase
    .from("trip_preferences")
    .select("departure_location")
    .eq("trip_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  const departureLocation = preferences?.departure_location || ""
  const destinationName = trip.destinations?.name || ""

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">{trip.name} - Flight Search</h1>
      <p className="text-muted-foreground mb-6">
        Search and save flights for your trip to {destinationName || "your destination"}
      </p>

      <EnhancedFlightSearch
        tripId={params.id}
        initialDestination={destinationName}
        initialDepartureLocation={departureLocation}
      />
    </div>
  )
}

import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SearchTabs } from "@/components/search/search-tabs"
import { CostEstimation } from "@/components/cost-estimation"
import { ItineraryBuilder } from "@/components/itinerary-builder"

export default async function TripPlannerPage({ params }: { params: { id: string } }) {
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
  const { data: trip } = await supabase.from("trips").select("*").eq("id", params.id).single()

  if (!trip) {
    redirect("/trips")
  }

  // Get selected destination
  let destinationName = "Unknown Destination"
  if (trip.selected_destination_id) {
    const { data: destination } = await supabase
      .from("destinations")
      .select("name")
      .eq("id", trip.selected_destination_id)
      .single()

    if (destination) {
      destinationName = destination.name
    }
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from("trip_preferences")
    .select("departure_location")
    .eq("trip_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  const departureLocation = preferences?.departure_location || ""

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">{trip.name} - Trip Planner</h1>
      <p className="text-muted-foreground mb-6">Plan your trip to {destinationName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SearchTabs tripId={params.id} destination={destinationName} departureLocation={departureLocation} />
        </div>
        <div>
          <div className="space-y-6">
            <CostEstimation tripId={params.id} destination={destinationName} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ItineraryBuilder tripId={params.id} destination={destinationName} />
      </div>
    </div>
  )
}

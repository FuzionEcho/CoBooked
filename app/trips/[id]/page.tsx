import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { TripDetails } from "@/components/trip-details"
import { TripMembers } from "@/components/trip-members"
import { TripDestinations } from "@/components/trip-destinations"
import { TripPreferences } from "@/components/trip-preferences"
import { SearchTabs } from "@/components/search/search-tabs"
import { CostEstimation } from "@/components/cost-estimation"
import { ItineraryBuilder } from "@/components/itinerary-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TripPage({ params }: { params: { id: string } }) {
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

  // Get selected destination if any
  let selectedDestination = null
  if (trip.selected_destination_id) {
    const { data: destination } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", trip.selected_destination_id)
      .single()

    selectedDestination = destination
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from("trip_preferences")
    .select("*")
    .eq("trip_id", params.id)
    .eq("user_id", session.user.id)
    .single()

  return (
    <div className="container py-10">
      <TripDetails trip={trip} userRole={memberData.role} />

      <Tabs defaultValue="members" className="mt-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-6">
          <TripMembers tripId={params.id} userRole={memberData.role} />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
          <TripPreferences tripId={params.id} userId={session.user.id} />
        </TabsContent>
        <TabsContent value="destinations" className="mt-6">
          <TripDestinations tripId={params.id} userRole={memberData.role} />
        </TabsContent>
        <TabsContent value="search" className="mt-6">
          {selectedDestination ? (
            <div className="space-y-6">
              <SearchTabs
                tripId={params.id}
                destination={selectedDestination.name}
                departureLocation={preferences?.departure_location || ""}
              />
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold mb-2">No destination selected</h3>
              <p className="text-muted-foreground">
                Please select a destination in the Destinations tab before searching for flights, hotels, and
                activities.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="planning" className="mt-6">
          {selectedDestination ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ItineraryBuilder tripId={params.id} destination={selectedDestination.name} />
              </div>
              <div>
                <CostEstimation tripId={params.id} destination={selectedDestination.name} />
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-semibold mb-2">No destination selected</h3>
              <p className="text-muted-foreground">
                Please select a destination in the Destinations tab before planning your trip.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

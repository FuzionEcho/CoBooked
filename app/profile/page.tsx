import type { Metadata } from "next"
import { ProfileHeader } from "@/components/profile/profile-header"
import { TravelStats } from "@/components/profile/travel-stats"
import { UpcomingTrips } from "@/components/profile/upcoming-trips"
import { TravelPreferences } from "@/components/profile/travel-preferences"
import { getSession } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export const metadata: Metadata = {
  title: "Profile | TripMate",
  description: "View and manage your travel profile",
}

export default async function ProfilePage() {
  // Use getSession instead of directly creating a client
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/profile")
  }

  // Get user details from the database
  const supabase = createServerSupabaseClient()
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Use actual user data if available, otherwise use mock data
  const user = {
    id: session.user.id,
    name: userProfile?.full_name || "Travel Enthusiast",
    email: session.user.email,
    avatar: userProfile?.avatar_url || "/diverse-profile-avatars.png",
    location: userProfile?.location || "Somewhere on Earth",
    joinedDate: new Date(session.user.created_at || Date.now()).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    bio: "Avid traveler and photography enthusiast. Always looking for the next adventure!",
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <ProfileHeader user={user} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <TravelStats userId={user.id} />
          <UpcomingTrips userId={user.id} />
        </div>
        <div>
          <TravelPreferences userId={user.id} />
        </div>
      </div>
    </div>
  )
}

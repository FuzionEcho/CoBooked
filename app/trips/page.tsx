import { redirect } from "next/navigation"
import { getSession } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { TripsList } from "@/components/trips-list"

export default async function TripsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button asChild>
          <Link href="/trips/book" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Book New Trip
          </Link>
        </Button>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Upcoming Trips</h2>
          <TripsList userId={session.user.id} type="upcoming" />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Past Trips</h2>
          <TripsList userId={session.user.id} type="past" />
        </section>
      </div>
    </div>
  )
}

import { StandaloneFlightSearch } from "@/components/standalone-flight-search"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flight Search | TripMate",
  description: "Search for flights to your favorite destinations",
}

export default function FlightsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Flight Search</h1>
      <p className="text-muted-foreground mb-8">
        Find the best flights to your favorite destinations. Compare prices, airlines, and schedules to book your
        perfect trip.
      </p>
      <StandaloneFlightSearch />
    </div>
  )
}

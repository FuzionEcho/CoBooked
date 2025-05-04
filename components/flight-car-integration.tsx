"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"
import { useRouter } from "next/navigation"

interface FlightCarIntegrationProps {
  destination: string
  arrivalDate: string
  departureDate: string
}

export function FlightCarIntegration({ destination, arrivalDate, departureDate }: FlightCarIntegrationProps) {
  const router = useRouter()

  const handleSearchCars = () => {
    // Navigate to car hire page with pre-filled search parameters
    router.push(`/car-hire?pickup=${destination}&pickupDate=${arrivalDate}&dropoffDate=${departureDate}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Need a car at your destination?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Complete your trip by booking a car in {destination}. We've found great deals from top rental companies.
        </p>
        <Button onClick={handleSearchCars} className="w-full">
          Search Car Hire in {destination}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlightSearch } from "./flight-search"
import { HotelSearch } from "./hotel-search"
import { ActivitySearch } from "./activity-search"
import { Plane, Hotel, Compass } from "lucide-react"
import Link from "next/link"

interface SearchTabsProps {
  tripId: string
  destination?: string
  departureLocation?: string
}

export function SearchTabs({ tripId, destination = "", departureLocation = "" }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState("flights")

  // Ensure destination is never an empty string
  const safeDestination = destination || "Unknown"

  return (
    <Tabs defaultValue="flights" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="flights" className="flex items-center gap-2">
          <Plane className="h-4 w-4" />
          <span className="hidden sm:inline">Flights</span>
        </TabsTrigger>
        <TabsTrigger value="hotels" className="flex items-center gap-2">
          <Hotel className="h-4 w-4" />
          <span className="hidden sm:inline">Hotels</span>
        </TabsTrigger>
        <TabsTrigger value="activities" className="flex items-center gap-2">
          <Compass className="h-4 w-4" />
          <span className="hidden sm:inline">Activities</span>
        </TabsTrigger>
        <Link
          href="/flights/multi-city"
          className="flex items-center justify-center gap-2 text-sm font-medium border-b-2 border-transparent hover:text-primary hover:border-primary transition-colors px-3"
        >
          <Plane className="h-4 w-4 rotate-45" />
          <span className="hidden sm:inline">Multi-City</span>
        </Link>
      </TabsList>
      <TabsContent value="flights" className="mt-4">
        <FlightSearch tripId={tripId} destination={safeDestination} departureLocation={departureLocation} />
      </TabsContent>
      <TabsContent value="hotels" className="mt-4">
        <HotelSearch tripId={tripId} destination={safeDestination} />
      </TabsContent>
      <TabsContent value="activities" className="mt-4">
        <ActivitySearch tripId={tripId} destination={safeDestination} />
      </TabsContent>
    </Tabs>
  )
}

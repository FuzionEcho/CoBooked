"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Plane, Clock, Save, Check, ExternalLink, AlertTriangle, Info } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface MultiCityFlightResult {
  id: string
  price: number
  currency: string
  legs: {
    id: string
    airline: string
    flightNumber: string
    departureAirport: string
    departureTime: string
    arrivalAirport: string
    arrivalTime: string
    duration: string
    stops: number
  }[]
  deepLink?: string
  agentName?: string
}

interface MultiCityFlightResultsProps {
  results: any
  loading: boolean
}

export function MultiCityFlightResults({ results, loading }: MultiCityFlightResultsProps) {
  const { toast } = useToast()
  const [savedFlights, setSavedFlights] = useState<string[]>([])
  const [selectedFlight, setSelectedFlight] = useState<MultiCityFlightResult | null>(null)

  // Process the API response to extract multi-city flight results
  const processResults = (): MultiCityFlightResult[] => {
    if (!results || !results.content || !results.content.results || !results.content.results.itineraries) {
      return []
    }

    try {
      const itineraries = Object.values(results.content.results.itineraries) as any[]
      const legs = results.content.results.legs || {}

      return itineraries.map((itinerary: any, index: number) => {
        // Extract price information
        const price = itinerary.price?.amount || 0
        const currency = itinerary.price?.currency || "USD"

        // Extract leg information
        const legIds = itinerary.legIds || []
        const flightLegs = legIds.map((legId: string) => {
          const leg = legs[legId] || {}
          return {
            id: legId,
            airline: (leg.carriers && leg.carriers[0]?.name) || "Unknown Airline",
            flightNumber: `${(leg.carriers && leg.carriers[0]?.code) || "XX"}${Math.floor(Math.random() * 1000) + 100}`,
            departureAirport: leg.origin?.display_code || "???",
            departureTime: leg.departure || "??:??",
            arrivalAirport: leg.destination?.display_code || "???",
            arrivalTime: leg.arrival || "??:??",
            duration: formatDuration(leg.durationInMinutes || 0),
            stops: Array.isArray(leg.stops) ? leg.stops.length : 0,
          }
        })

        // Extract booking link
        let deepLink = ""
        let agentName = ""

        if (itinerary.pricingOptions && itinerary.pricingOptions.length > 0) {
          const pricingOption = itinerary.pricingOptions[0]
          if (pricingOption.items && pricingOption.items.length > 0) {
            deepLink = pricingOption.items[0].deepLink || ""
            agentName = pricingOption.items[0].agentId || ""
          }
        }

        return {
          id: `multi-city-${index}`,
          price,
          currency,
          legs: flightLegs,
          deepLink,
          agentName,
        }
      })
    } catch (error) {
      console.error("Error processing multi-city flight results:", error)
      return []
    }
  }

  const formatDuration = (minutes: number): string => {
    if (!minutes || isNaN(minutes)) return "0h 0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const saveFlight = (flight: MultiCityFlightResult) => {
    if (savedFlights.includes(flight.id)) {
      setSavedFlights(savedFlights.filter((id) => id !== flight.id))
      toast({
        title: "Flight removed",
        description: "This flight has been removed from your saved list",
      })
    } else {
      setSavedFlights([...savedFlights, flight.id])
      toast({
        title: "Flight saved",
        description: "This flight has been saved to your list",
      })
    }
  }

  const flightResults = processResults()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-City Flight Results</CardTitle>
        <CardDescription>{flightResults.length} multi-city itineraries found</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : flightResults.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No multi-city flights found matching your criteria.</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {flightResults.map((flight) => (
                <Card key={flight.id} className="overflow-hidden">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Multi-City Itinerary</div>
                      <div className="text-lg font-semibold">{formatPrice(flight.price, flight.currency)}</div>
                    </div>
                    {flight.agentName && (
                      <div className="text-sm text-muted-foreground">Provided by {flight.agentName}</div>
                    )}
                  </div>
                  <div className="p-4">
                    {/* Flight legs */}
                    <div className="space-y-6">
                      {flight.legs.map((leg, legIndex) => (
                        <div key={leg.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="font-medium mb-2">Flight {legIndex + 1}</div>
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div className="flex flex-col items-start">
                              <div className="text-xl font-bold">{leg.departureTime}</div>
                              <div className="text-sm text-muted-foreground">{leg.departureAirport}</div>
                            </div>

                            <div className="flex flex-col items-center my-2 md:my-0">
                              <div className="text-xs text-muted-foreground">{leg.duration}</div>
                              <div className="flex items-center w-24 md:w-40">
                                <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                                <Plane className="h-3 w-3 mx-1 text-muted-foreground transform rotate-90" />
                                <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {leg.stops === 0 ? (
                                  <Badge variant="outline" className="text-xs">
                                    Nonstop
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    {leg.stops} {leg.stops === 1 ? "stop" : "stops"}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <div className="text-xl font-bold">{leg.arrivalTime}</div>
                              <div className="text-sm text-muted-foreground">{leg.arrivalAirport}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {leg.airline}
                            </Badge>
                            <Badge variant="outline" className="mr-2">
                              {leg.flightNumber}
                            </Badge>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {leg.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Multi-city warning */}
                    <Alert variant="warning" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Multi-City Booking</AlertTitle>
                      <AlertDescription>
                        This is a multi-city itinerary. Please review all flight details carefully before booking.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveFlight(flight)}
                        className={savedFlights.includes(flight.id) ? "bg-primary/10" : ""}
                      >
                        {savedFlights.includes(flight.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>

                      {flight.deepLink ? (
                        <Button asChild>
                          <a href={flight.deepLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Book Now
                          </a>
                        </Button>
                      ) : (
                        <Button disabled>
                          <Info className="h-4 w-4 mr-2" />
                          No Booking Link
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

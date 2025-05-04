"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn, formatPrice } from "@/lib/utils"
import { CalendarIcon, Loader2, ArrowRight, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { searchFlights, type FlightSearchResult } from "@/lib/search-service"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FlightSearchProps {
  tripId: string
  destination: any
  initialDepartureLocation?: string
}

interface Airport {
  entityId: string
  name: string
  iata: string
  cityName?: string
  countryName?: string
}

export function FlightSearch({ tripId, destination, initialDepartureLocation = "" }: FlightSearchProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchingAirports, setSearchingAirports] = useState(false)
  const [departureQuery, setDepartureQuery] = useState(initialDepartureLocation)
  const [departureAirports, setDepartureAirports] = useState<Airport[]>([])
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<string>("")
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([])
  const [selectedDestinationAirport, setSelectedDestinationAirport] = useState<string>("")
  const [departureDate, setDepartureDate] = useState<Date | undefined>()
  const [returnDate, setReturnDate] = useState<Date | undefined>()
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState("economy")
  const [flightResults, setFlightResults] = useState<FlightSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [savedFlights, setSavedFlights] = useState<string[]>([])

  // Search for departure airports when the query changes
  useEffect(() => {
    const searchAirports = async () => {
      if (departureQuery.length < 2) {
        setDepartureAirports([])
        return
      }

      setSearchingAirports(true)
      try {
        const response = await fetch(`/api/flights/airports?query=${encodeURIComponent(departureQuery)}`)
        const data = await response.json()

        if (data.places) {
          setDepartureAirports(data.places.filter((place: any) => place.iata))
        } else {
          // Mock data if API fails
          setDepartureAirports([
            { entityId: "1", name: "New York JFK", iata: "JFK", cityName: "New York", countryName: "United States" },
            { entityId: "2", name: "Los Angeles", iata: "LAX", cityName: "Los Angeles", countryName: "United States" },
            { entityId: "3", name: "London Heathrow", iata: "LHR", cityName: "London", countryName: "United Kingdom" },
          ])
        }
      } catch (error) {
        console.error("Error searching airports:", error)
        // Mock data on error
        setDepartureAirports([
          { entityId: "1", name: "New York JFK", iata: "JFK", cityName: "New York", countryName: "United States" },
          { entityId: "2", name: "Los Angeles", iata: "LAX", cityName: "Los Angeles", countryName: "United States" },
          { entityId: "3", name: "London Heathrow", iata: "LHR", cityName: "London", countryName: "United Kingdom" },
        ])
      } finally {
        setSearchingAirports(false)
      }
    }

    const timeoutId = setTimeout(searchAirports, 500)
    return () => clearTimeout(timeoutId)
  }, [departureQuery])

  // Search for destination airports based on destination name
  useEffect(() => {
    const searchDestinationAirports = async () => {
      if (!destination?.name) return

      try {
        const response = await fetch(`/api/flights/airports?query=${encodeURIComponent(destination.name)}`)
        const data = await response.json()

        if (data.places && data.places.length > 0) {
          const filteredAirports = data.places.filter((place: any) => place.iata)
          setDestinationAirports(filteredAirports)
          if (filteredAirports.length > 0) {
            setSelectedDestinationAirport(filteredAirports[0].iata)
          }
        } else {
          // Mock data if API fails
          const mockAirports = [
            {
              entityId: "1",
              name: `${destination.name} International Airport`,
              iata: destination.name.substring(0, 3).toUpperCase(),
              cityName: destination.name,
              countryName: "Country",
            },
            {
              entityId: "2",
              name: `${destination.name} City Airport`,
              iata: destination.name.substring(0, 2).toUpperCase() + "X",
              cityName: destination.name,
              countryName: "Country",
            },
          ]
          setDestinationAirports(mockAirports)
          setSelectedDestinationAirport(mockAirports[0].iata)
        }
      } catch (error) {
        console.error("Error searching destination airports:", error)
        // Mock data on error
        const mockAirports = [
          {
            entityId: "1",
            name: `${destination.name} International Airport`,
            iata: destination.name.substring(0, 3).toUpperCase(),
            cityName: destination.name,
            countryName: "Country",
          },
          {
            entityId: "2",
            name: `${destination.name} City Airport`,
            iata: destination.name.substring(0, 2).toUpperCase() + "X",
            cityName: destination.name,
            countryName: "Country",
          },
        ]
        setDestinationAirports(mockAirports)
        setSelectedDestinationAirport(mockAirports[0].iata)
      }
    }

    searchDestinationAirports()
  }, [destination])

  const handleSearch = async () => {
    if (!selectedDepartureAirport || !selectedDestinationAirport || !departureDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const results = await searchFlights({
        origin: selectedDepartureAirport,
        destination: selectedDestinationAirport,
        departureDate: format(departureDate, "yyyy-MM-dd"),
        returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
        adults: passengers,
        cabinClass: cabinClass.toUpperCase(),
      })

      setFlightResults(results)
    } catch (error) {
      console.error("Error searching flights:", error)
      toast({
        title: "Error",
        description: "Failed to search for flights. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveFlight = async (flightId: string) => {
    try {
      if (savedFlights.includes(flightId)) {
        setSavedFlights(savedFlights.filter((id) => id !== flightId))
      } else {
        setSavedFlights([...savedFlights, flightId])

        // In a real app, you would save this to the database
        toast({
          title: "Flight saved",
          description: "This flight has been saved to your trip",
        })
      }
    } catch (error) {
      console.error("Error saving flight:", error)
      toast({
        title: "Error",
        description: "Failed to save flight. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure">Departure Airport</Label>
              <div className="relative">
                <Input
                  id="departure"
                  placeholder="Search airports..."
                  value={departureQuery}
                  onChange={(e) => setDepartureQuery(e.target.value)}
                />
                {searchingAirports && (
                  <div className="absolute right-2 top-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {departureAirports.length > 0 && departureQuery.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul>
                      {departureAirports.map((airport) => (
                        <li
                          key={airport.entityId}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedDepartureAirport(airport.iata)
                            setDepartureQuery(`${airport.name} (${airport.iata})`)
                            setDepartureAirports([])
                          }}
                        >
                          {airport.name} ({airport.iata}){airport.cityName && ` - ${airport.cityName}`}
                          {airport.countryName && `, ${airport.countryName}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Airport</Label>
              <Select value={selectedDestinationAirport} onValueChange={setSelectedDestinationAirport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination airport" />
                </SelectTrigger>
                <SelectContent>
                  {destinationAirports.length === 0 && (
                    <SelectItem value="no-airports" disabled>
                      No airports found
                    </SelectItem>
                  )}
                  {destinationAirports.map((airport) => (
                    <SelectItem key={airport.entityId} value={airport.iata}>
                      {airport.name} ({airport.iata}){airport.cityName && ` - ${airport.cityName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Return Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    disabled={(date) => date < new Date() || (departureDate ? date < departureDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Passengers</Label>
              <Select value={passengers.toString()} onValueChange={(value) => setPassengers(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of passengers" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "passenger" : "passengers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cabin Class</Label>
              <Select value={cabinClass} onValueChange={setCabinClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cabin class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search Flights"
            )}
          </Button>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : flightResults.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">No flights found.</div>
            ) : (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="space-y-4 p-4">
                  {flightResults.map((flight) => (
                    <div key={flight.id} className="border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                        <div>
                          <div className="text-sm font-bold">{flight.legs[0].origin.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(flight.legs[0].departureDateTime), "EEE, MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <ArrowRight className="h-5 w-5" />
                          <div className="text-xs text-muted-foreground">{flight.legs[0].duration}</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold">{flight.legs[0].destination.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(flight.legs[0].arrivalDateTime), "EEE, MMM d, yyyy h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border-t">
                        <div>
                          <div className="text-lg font-bold">{formatPrice(flight.price)}</div>
                          <div className="text-xs text-muted-foreground">per person</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toggleSaveFlight(flight.id)}>
                          {savedFlights.includes(flight.id) ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Saved
                            </>
                          ) : (
                            "Save Flight"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

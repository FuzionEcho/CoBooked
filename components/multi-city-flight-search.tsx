"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2, Plane, Search, X, Plus, Trash2, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Airport {
  entityId: string
  name: string
  iata: string
  cityName?: string
  countryName?: string
}

interface FlightLeg {
  id: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  date: Date | undefined
}

export function MultiCityFlightSearch({ onSearch }: { onSearch: (results: any) => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchingAirports, setSearchingAirports] = useState(false)
  const [currentSearchField, setCurrentSearchField] = useState<{
    legIndex: number
    type: "origin" | "destination"
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Airport[]>([])
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState("economy")

  // Multi-city legs
  const [legs, setLegs] = useState<FlightLeg[]>([
    {
      id: `leg-${Date.now()}-0`,
      origin: "",
      originCode: "",
      destination: "",
      destinationCode: "",
      date: addDays(new Date(), 7),
    },
    {
      id: `leg-${Date.now()}-1`,
      origin: "",
      originCode: "",
      destination: "",
      destinationCode: "",
      date: addDays(new Date(), 14),
    },
  ])

  // Search for airports when the query changes
  useEffect(() => {
    const searchAirports = async (query: string) => {
      if (query.length < 2) {
        setSearchResults([])
        return
      }

      setSearchingAirports(true)
      try {
        const response = await fetch(`/api/flights/airports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.places && data.places.length > 0) {
          setSearchResults(data.places.filter((place: any) => place.iata))
        } else {
          setSearchResults([])
          toast({
            title: "No airports found",
            description: "Try a different search term",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error searching airports:", error)
        setSearchResults([])
        toast({
          title: "Error searching airports",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setSearchingAirports(false)
      }
    }

    if (currentSearchField) {
      const timeoutId = setTimeout(() => searchAirports(searchQuery), 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, currentSearchField, toast])

  const addLeg = () => {
    if (legs.length >= 6) {
      toast({
        title: "Maximum legs reached",
        description: "You can add a maximum of 6 flight legs",
        variant: "destructive",
      })
      return
    }

    const lastLeg = legs[legs.length - 1]
    const newLeg: FlightLeg = {
      id: `leg-${Date.now()}-${legs.length}`,
      origin: lastLeg.destination,
      originCode: lastLeg.destinationCode,
      destination: "",
      destinationCode: "",
      date: lastLeg.date ? addDays(lastLeg.date, 7) : addDays(new Date(), 7 * (legs.length + 1)),
    }

    setLegs([...legs, newLeg])
  }

  const removeLeg = (index: number) => {
    if (legs.length <= 2) {
      toast({
        title: "Minimum legs required",
        description: "Multi-city search requires at least 2 flight legs",
        variant: "destructive",
      })
      return
    }

    const newLegs = [...legs]
    newLegs.splice(index, 1)
    setLegs(newLegs)
  }

  const updateLeg = (index: number, field: keyof FlightLeg, value: any) => {
    const newLegs = [...legs]
    newLegs[index] = { ...newLegs[index], [field]: value }
    setLegs(newLegs)
  }

  const selectAirport = (airport: Airport) => {
    if (!currentSearchField) return

    const { legIndex, type } = currentSearchField
    const newLegs = [...legs]

    if (type === "origin") {
      newLegs[legIndex].origin = `${airport.name} (${airport.iata})`
      newLegs[legIndex].originCode = airport.iata
    } else {
      newLegs[legIndex].destination = `${airport.name} (${airport.iata})`
      newLegs[legIndex].destinationCode = airport.iata

      // If there's a next leg, update its origin to match this destination
      if (legIndex < newLegs.length - 1) {
        newLegs[legIndex + 1].origin = `${airport.name} (${airport.iata})`
        newLegs[legIndex + 1].originCode = airport.iata
      }
    }

    setLegs(newLegs)
    setCurrentSearchField(null)
    setSearchQuery("")
    setSearchResults([])
  }

  const handleSearch = async () => {
    // Validate all legs have required fields
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i]
      if (!leg.originCode || !leg.destinationCode || !leg.date) {
        toast({
          title: "Missing information",
          description: `Please fill in all required fields for flight leg ${i + 1}`,
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    try {
      // Format legs for API request
      const queryLegs = legs.map((leg) => ({
        origin: leg.originCode,
        destination: leg.destinationCode,
        date: format(leg.date!, "yyyy-MM-dd"),
      }))

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          queryLegs,
          adults: passengers,
          cabinClass: cabinClass.toUpperCase(),
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      onSearch(data)
    } catch (error) {
      console.error("Error searching flights:", error)
      toast({
        title: "Error searching flights",
        description: "Failed to search for flights. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-City Flight Search</CardTitle>
        <CardDescription>Search for flights with multiple stops in different cities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About Multi-City Search</AlertTitle>
          <AlertDescription>
            Plan a complex itinerary with up to 6 different flight legs. Each leg can have different origin and
            destination cities.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="passengers">Passengers:</Label>
            <Select value={passengers.toString()} onValueChange={(value) => setPassengers(Number.parseInt(value))}>
              <SelectTrigger id="passengers" className="w-[100px]">
                <SelectValue placeholder="Passengers" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="cabin-class">Cabin:</Label>
            <Select value={cabinClass} onValueChange={setCabinClass}>
              <SelectTrigger id="cabin-class" className="w-[150px]">
                <SelectValue placeholder="Cabin Class" />
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

        {/* Flight Legs */}
        <div className="space-y-6">
          {legs.map((leg, index) => (
            <div key={leg.id} className="p-4 border rounded-md relative">
              <div className="absolute -top-3 left-4 bg-background px-2 text-sm font-medium">Flight {index + 1}</div>

              {index > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-3 right-2 h-6 w-6"
                  onClick={() => removeLeg(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Label htmlFor={`origin-${index}`} className="mb-2 block">
                    From
                  </Label>
                  <div className="relative">
                    <Input
                      id={`origin-${index}`}
                      placeholder="City or airport"
                      value={
                        currentSearchField?.legIndex === index && currentSearchField?.type === "origin"
                          ? searchQuery
                          : leg.origin
                      }
                      onChange={(e) => {
                        setCurrentSearchField({ legIndex: index, type: "origin" })
                        setSearchQuery(e.target.value)
                      }}
                      onFocus={() => {
                        setCurrentSearchField({ legIndex: index, type: "origin" })
                        setSearchQuery(leg.origin)
                      }}
                      className="pl-10"
                    />
                    <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {leg.origin && (
                      <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => {
                          updateLeg(index, "origin", "")
                          updateLeg(index, "originCode", "")
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  {currentSearchField?.legIndex === index &&
                    currentSearchField?.type === "origin" &&
                    searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul>
                          {searchResults.map((airport) => (
                            <li
                              key={airport.entityId}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => selectAirport(airport)}
                            >
                              <div className="flex items-center">
                                <div className="mr-2 bg-muted rounded-full p-1">
                                  <Plane className="h-3 w-3" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {airport.name} ({airport.iata})
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {airport.cityName && `${airport.cityName}, `}
                                    {airport.countryName}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="relative">
                  <Label htmlFor={`destination-${index}`} className="mb-2 block">
                    To
                  </Label>
                  <div className="relative">
                    <Input
                      id={`destination-${index}`}
                      placeholder="City or airport"
                      value={
                        currentSearchField?.legIndex === index && currentSearchField?.type === "destination"
                          ? searchQuery
                          : leg.destination
                      }
                      onChange={(e) => {
                        setCurrentSearchField({ legIndex: index, type: "destination" })
                        setSearchQuery(e.target.value)
                      }}
                      onFocus={() => {
                        setCurrentSearchField({ legIndex: index, type: "destination" })
                        setSearchQuery(leg.destination)
                      }}
                      className="pl-10"
                    />
                    <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {leg.destination && (
                      <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => {
                          updateLeg(index, "destination", "")
                          updateLeg(index, "destinationCode", "")
                        }}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  {currentSearchField?.legIndex === index &&
                    currentSearchField?.type === "destination" &&
                    searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul>
                          {searchResults.map((airport) => (
                            <li
                              key={airport.entityId}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => selectAirport(airport)}
                            >
                              <div className="flex items-center">
                                <div className="mr-2 bg-muted rounded-full p-1">
                                  <Plane className="h-3 w-3" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {airport.name} ({airport.iata})
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {airport.cityName && `${airport.cityName}, `}
                                    {airport.countryName}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !leg.date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leg.date ? format(leg.date, "EEE, MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={leg.date}
                      onSelect={(date) => updateLeg(index, "date", date)}
                      initialFocus
                      disabled={(date) => {
                        // Disable dates before today
                        if (date < new Date()) return true

                        // Disable dates before previous leg's date
                        if (index > 0 && legs[index - 1].date && date < legs[index - 1].date) {
                          return true
                        }

                        return false
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={addLeg} disabled={legs.length >= 6} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Another Flight
          </Button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-center text-muted-foreground">
                <Info className="h-3 w-3 inline mr-1" />
                Maximum 6 flight legs allowed
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>The Skyscanner API supports a maximum of 6 flight legs for multi-city searches.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSearch} disabled={loading} className="w-full bg-primary hover:bg-primary/90" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Search Multi-City Flights
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

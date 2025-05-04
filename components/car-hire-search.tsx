"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Car, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface CarHireSearchProps {
  onSearch: (searchParams: CarHireSearchParams) => void
  initialPickupLocation?: string
  initialDropoffLocation?: string
  initialPickupDate?: Date
  initialDropoffDate?: Date
}

export interface CarHireSearchParams {
  pickupLocation: string
  pickupLocationId: string
  dropoffLocation: string
  dropoffLocationId: string
  pickupDate: Date
  dropoffDate: Date
  driverAge: number
}

interface LocationSuggestion {
  entityId: string
  name: string
  type: string
  hierarchy: string[]
  location?: {
    latitude: number
    longitude: number
  }
}

export function CarHireSearch({
  onSearch,
  initialPickupLocation = "",
  initialDropoffLocation = "",
  initialPickupDate = new Date(),
  initialDropoffDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
}: CarHireSearchProps) {
  const [pickupLocation, setPickupLocation] = useState(initialPickupLocation)
  const [pickupLocationId, setPickupLocationId] = useState("")
  const [dropoffLocation, setDropoffLocation] = useState(initialDropoffLocation)
  const [dropoffLocationId, setDropoffLocationId] = useState("")
  const [pickupDate, setPickupDate] = useState<Date>(initialPickupDate)
  const [dropoffDate, setDropoffDate] = useState<Date>(initialDropoffDate)
  const [driverAge, setDriverAge] = useState(30)
  const [sameLocation, setSameLocation] = useState(true)

  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoadingPickup, setIsLoadingPickup] = useState(false)
  const [isLoadingDropoff, setIsLoadingDropoff] = useState(false)
  const [pickupOpen, setPickupOpen] = useState(false)
  const [dropoffOpen, setDropoffOpen] = useState(false)

  const pickupDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const dropoffDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLocationSuggestions = async (query: string, isPickup: boolean) => {
    try {
      if (isPickup) {
        setIsLoadingPickup(true)
      } else {
        setIsLoadingDropoff(true)
      }

      const response = await fetch("/api/car-hire/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (isPickup) {
        setPickupSuggestions(data.places || [])
        setIsLoadingPickup(false)
      } else {
        setDropoffSuggestions(data.places || [])
        setIsLoadingDropoff(false)
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error)
      if (isPickup) {
        setIsLoadingPickup(false)
      } else {
        setIsLoadingDropoff(false)
      }
    }
  }

  useEffect(() => {
    if (pickupDebounceRef.current) {
      clearTimeout(pickupDebounceRef.current)
    }

    if (pickupLocation.length > 1) {
      pickupDebounceRef.current = setTimeout(() => {
        fetchLocationSuggestions(pickupLocation, true)
      }, 300)
    } else if (pickupLocation === "") {
      // Fetch popular locations when input is empty
      fetchLocationSuggestions("", true)
    }

    return () => {
      if (pickupDebounceRef.current) {
        clearTimeout(pickupDebounceRef.current)
      }
    }
  }, [pickupLocation])

  useEffect(() => {
    if (dropoffDebounceRef.current) {
      clearTimeout(dropoffDebounceRef.current)
    }

    if (!sameLocation && dropoffLocation.length > 1) {
      dropoffDebounceRef.current = setTimeout(() => {
        fetchLocationSuggestions(dropoffLocation, false)
      }, 300)
    } else if (!sameLocation && dropoffLocation === "") {
      // Fetch popular locations when input is empty
      fetchLocationSuggestions("", false)
    }

    return () => {
      if (dropoffDebounceRef.current) {
        clearTimeout(dropoffDebounceRef.current)
      }
    }
  }, [dropoffLocation, sameLocation])

  const handleSearch = () => {
    onSearch({
      pickupLocation,
      pickupLocationId,
      dropoffLocation: sameLocation ? pickupLocation : dropoffLocation,
      dropoffLocationId: sameLocation ? pickupLocationId : dropoffLocationId,
      pickupDate,
      dropoffDate,
      driverAge,
    })
  }

  const formatLocationDisplay = (location: LocationSuggestion) => {
    const type =
      location.type === "PLACE_TYPE_AIRPORT"
        ? "Airport"
        : location.type === "PLACE_TYPE_CITY"
          ? "City"
          : location.type === "PLACE_TYPE_TRAIN_STATION"
            ? "Train Station"
            : location.type === "PLACE_TYPE_DISTRICT"
              ? "District"
              : ""

    return `${location.name} (${type})`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Car Hire Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pickup-location">Pickup Location</Label>
            <Popover open={pickupOpen} onOpenChange={setPickupOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={pickupOpen} className="w-full justify-between">
                  {pickupLocation || "Select pickup location..."}
                  {isLoadingPickup && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search for locations..."
                    value={pickupLocation}
                    onValueChange={setPickupLocation}
                  />
                  <CommandList>
                    <CommandEmpty>No locations found.</CommandEmpty>
                    <CommandGroup>
                      {pickupSuggestions.map((location) => (
                        <CommandItem
                          key={`${location.entityId}-${location.type}`}
                          value={location.name}
                          onSelect={() => {
                            setPickupLocation(location.name)
                            setPickupLocationId(location.entityId)
                            setPickupOpen(false)
                          }}
                        >
                          {formatLocationDisplay(location)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="same-location"
              checked={sameLocation}
              onChange={(e) => setSameLocation(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="same-location" className="text-sm">
              Return to same location
            </Label>
          </div>

          {!sameLocation && (
            <div className="grid gap-2">
              <Label htmlFor="dropoff-location">Drop-off Location</Label>
              <Popover open={dropoffOpen} onOpenChange={setDropoffOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dropoffOpen}
                    className="w-full justify-between"
                  >
                    {dropoffLocation || "Select dropoff location..."}
                    {isLoadingDropoff && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search for locations..."
                      value={dropoffLocation}
                      onValueChange={setDropoffLocation}
                    />
                    <CommandList>
                      <CommandEmpty>No locations found.</CommandEmpty>
                      <CommandGroup>
                        {dropoffSuggestions.map((location) => (
                          <CommandItem
                            key={`${location.entityId}-${location.type}`}
                            value={location.name}
                            onSelect={() => {
                              setDropoffLocation(location.name)
                              setDropoffLocationId(location.entityId)
                              setDropoffOpen(false)
                            }}
                          >
                            {formatLocationDisplay(location)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Pickup Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(pickupDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(date) => date && setPickupDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Drop-off Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dropoffDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dropoffDate}
                    onSelect={(date) => date && setDropoffDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="driver-age">Driver Age</Label>
            <Select value={driverAge.toString()} onValueChange={(value) => setDriverAge(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select driver age" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 79 }, (_, i) => i + 21).map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} className="w-full">
            Search Car Hire
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

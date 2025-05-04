"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { cn, formatPrice } from "@/lib/utils"
import {
  CalendarIcon,
  Loader2,
  Check,
  Save,
  Plane,
  ArrowLeftRight,
  Search,
  Clock,
  X,
  RefreshCw,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Info,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookingTypeExplainer } from "@/components/booking-type-explainer"
import { useRouter } from "next/navigation"

interface Airport {
  entityId: string
  name: string
  iata: string
  cityName?: string
  countryName?: string
}

interface FlightResult {
  id: string
  airline: string
  flightNumber: string
  departureAirport: string
  departureTime: string
  arrivalAirport: string
  arrivalTime: string
  duration: string
  stops: number
  price: number
  currency: string
  deepLink?: string
  legs: {
    origin: {
      name: string
      display_code: string
    }
    destination: {
      name: string
      display_code: string
    }
    departureDateTime: string
    arrivalDateTime: string
    duration: string
    stops: any[]
  }[]
  // Booking type fields
  transferType?: string
  agentIds?: string[]
  bookingLinks?: {
    agentId: string
    deepLink: string
  }[]
  isMultiBooking?: boolean
  mashupType?: MashupType
}

// Enum for transfer types
enum TransferType {
  UNSPECIFIED = "TRANSFER_TYPE_UNSPECIFIED",
  MANAGED = "TRANSFER_TYPE_MANAGED",
  SELF_TRANSFER = "TRANSFER_TYPE_SELF_TRANSFER",
  PROTECTED_SELF_TRANSFER = "TRANSFER_TYPE_PROTECTED_SELF_TRANSFER",
}

// Enum for mashup types
enum MashupType {
  NONE = "NONE",
  SUM_OF_ONE_WAY = "SUM_OF_ONE_WAY",
  NON_PROTECTED_SELF_TRANSFER = "NON_PROTECTED_SELF_TRANSFER",
}

// Mock flight data for testing and fallback
const mockFlightResults: FlightResult[] = [
  {
    id: "flight-1",
    airline: "American Airlines",
    flightNumber: "AA123",
    departureAirport: "JFK",
    departureTime: "08:30",
    arrivalAirport: "LAX",
    arrivalTime: "11:45",
    duration: "5h 15m",
    stops: 0,
    price: 299,
    currency: "USD",
    deepLink: "https://example.com/booking/aa123",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T08:30:00",
        arrivalDateTime: "2023-07-15T11:45:00",
        duration: "5h 15m",
        stops: [],
      },
    ],
    transferType: TransferType.MANAGED,
    agentIds: ["american"],
    bookingLinks: [
      {
        agentId: "american",
        deepLink: "https://example.com/booking/aa123",
      },
    ],
    isMultiBooking: false,
    mashupType: MashupType.NONE,
  },
  {
    id: "flight-2",
    airline: "Delta Air Lines",
    flightNumber: "DL456",
    departureAirport: "JFK",
    departureTime: "10:15",
    arrivalAirport: "LAX",
    arrivalTime: "13:40",
    duration: "5h 25m",
    stops: 0,
    price: 329,
    currency: "USD",
    deepLink: "https://example.com/booking/dl456",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T10:15:00",
        arrivalDateTime: "2023-07-15T13:40:00",
        duration: "5h 25m",
        stops: [],
      },
    ],
    transferType: TransferType.PROTECTED_SELF_TRANSFER,
    agentIds: ["expedia"],
    bookingLinks: [
      {
        agentId: "expedia",
        deepLink: "https://example.com/booking/dl456",
      },
    ],
    isMultiBooking: false,
    mashupType: MashupType.NONE,
  },
  {
    id: "flight-3",
    airline: "Multiple Airlines",
    flightNumber: "UA789+BA456",
    departureAirport: "JFK",
    departureTime: "13:45",
    arrivalAirport: "LAX",
    arrivalTime: "17:20",
    duration: "5h 35m",
    stops: 1,
    price: 275,
    currency: "USD",
    deepLink: "",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T13:45:00",
        arrivalDateTime: "2023-07-15T17:20:00",
        duration: "5h 35m",
        stops: [{ name: "Chicago O'Hare International Airport", code: "ORD" }],
      },
    ],
    transferType: TransferType.SELF_TRANSFER,
    agentIds: ["united", "british"],
    bookingLinks: [
      {
        agentId: "united",
        deepLink: "https://example.com/booking/ua789",
      },
      {
        agentId: "british",
        deepLink: "https://example.com/booking/ba456",
      },
    ],
    isMultiBooking: true,
    mashupType: MashupType.NONE,
  },
  {
    id: "flight-4",
    airline: "Multiple Airlines",
    flightNumber: "LH123+AF456",
    departureAirport: "JFK",
    departureTime: "19:30",
    arrivalAirport: "LAX",
    arrivalTime: "23:45",
    duration: "6h 15m",
    stops: 1,
    price: 310,
    currency: "USD",
    deepLink: "",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T19:30:00",
        arrivalDateTime: "2023-07-15T23:45:00",
        duration: "6h 15m",
        stops: [{ name: "Chicago O'Hare International Airport", code: "ORD" }],
      },
    ],
    transferType: TransferType.UNSPECIFIED,
    agentIds: ["lufthansa", "airfrance"],
    bookingLinks: [
      {
        agentId: "lufthansa",
        deepLink: "https://example.com/booking/lh123",
      },
      {
        agentId: "airfrance",
        deepLink: "https://example.com/booking/af456",
      },
    ],
    isMultiBooking: true,
    mashupType: MashupType.NONE,
  },
  {
    id: "flight-5",
    airline: "Multiple Airlines",
    flightNumber: "BA123+VS456",
    departureAirport: "JFK",
    departureTime: "07:30",
    arrivalAirport: "LAX",
    arrivalTime: "10:45",
    duration: "5h 15m",
    stops: 0,
    price: 285,
    currency: "USD",
    deepLink: "",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T07:30:00",
        arrivalDateTime: "2023-07-15T10:45:00",
        duration: "5h 15m",
        stops: [],
      },
    ],
    transferType: TransferType.SELF_TRANSFER,
    agentIds: ["british", "virgin"],
    bookingLinks: [
      {
        agentId: "british",
        deepLink: "https://example.com/booking/ba123",
      },
      {
        agentId: "virgin",
        deepLink: "https://example.com/booking/vs456",
      },
    ],
    isMultiBooking: true,
    mashupType: MashupType.SUM_OF_ONE_WAY,
  },
  {
    id: "flight-6",
    airline: "Multiple Airlines",
    flightNumber: "EK123+QF456",
    departureAirport: "JFK",
    departureTime: "21:30",
    arrivalAirport: "LAX",
    arrivalTime: "01:45",
    duration: "6h 15m",
    stops: 1,
    price: 265,
    currency: "USD",
    deepLink: "",
    legs: [
      {
        origin: {
          name: "John F. Kennedy International Airport",
          display_code: "JFK",
        },
        destination: {
          name: "Los Angeles International Airport",
          display_code: "LAX",
        },
        departureDateTime: "2023-07-15T21:30:00",
        arrivalDateTime: "2023-07-16T01:45:00",
        duration: "6h 15m",
        stops: [{ name: "Dallas/Fort Worth International Airport", code: "DFW" }],
      },
    ],
    transferType: TransferType.SELF_TRANSFER,
    agentIds: ["emirates", "qantas"],
    bookingLinks: [
      {
        agentId: "emirates",
        deepLink: "https://example.com/booking/ek123",
      },
      {
        agentId: "qantas",
        deepLink: "https://example.com/booking/qf456",
      },
    ],
    isMultiBooking: true,
    mashupType: MashupType.NON_PROTECTED_SELF_TRANSFER,
  },
]

export function StandaloneFlightSearch() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchingAirports, setSearchingAirports] = useState(false)
  const [departureQuery, setDepartureQuery] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")
  const [departureAirports, setDepartureAirports] = useState<Airport[]>([])
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([])
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState<string>("")
  const [selectedDestinationAirport, setSelectedDestinationAirport] = useState<string>("")
  const [departureDate, setDepartureDate] = useState<Date | undefined>(addDays(new Date(), 7))
  const [returnDate, setReturnDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [passengers, setPassengers] = useState(1)
  const [cabinClass, setCabinClass] = useState("economy")
  const [flightResults, setFlightResults] = useState<FlightResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [savedFlights, setSavedFlights] = useState<string[]>([])
  const [isRoundTrip, setIsRoundTrip] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [maxStops, setMaxStops] = useState<number | null>(null)
  const [airlines, setAirlines] = useState<string[]>([])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [departureTime, setDepartureTime] = useState<string>("any")
  const [returnTime, setReturnTime] = useState<string>("any")
  const [sortBy, setSortBy] = useState("price")
  const [useMockData, setUseMockData] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [showMashups, setShowMashups] = useState(true)
  const router = useRouter()

  // Polling state
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [searchProgress, setSearchProgress] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const [searchStatus, setSearchStatus] = useState<"idle" | "pending" | "complete" | "error">("idle")
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Search for airports when the query changes
  useEffect(() => {
    const searchAirports = async (query: string, setResults: (airports: Airport[]) => void) => {
      if (query.length < 2) {
        setResults([])
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
          setResults(data.places.filter((place: any) => place.iata))
        } else {
          setResults([])
          toast({
            title: "No airports found",
            description: "Try a different search term",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error searching airports:", error)
        setResults([])
        toast({
          title: "Error searching airports",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setSearchingAirports(false)
      }
    }

    const timeoutId = setTimeout(() => searchAirports(departureQuery, setDepartureAirports), 500)
    return () => clearTimeout(timeoutId)
  }, [departureQuery, toast])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (destinationQuery.length >= 2) {
        setSearchingAirports(true)
        fetch(`/api/flights/airports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: destinationQuery }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`)
            }
            return response.json()
          })
          .then((data) => {
            if (data.places && data.places.length > 0) {
              setDestinationAirports(data.places.filter((place: any) => place.iata))
            } else {
              setDestinationAirports([])
              toast({
                title: "No airports found",
                description: "Try a different search term",
                variant: "destructive",
              })
            }
          })
          .catch((error) => {
            console.error("Error searching airports:", error)
            setDestinationAirports([])
            toast({
              title: "Error searching airports",
              description: "Please try again later",
              variant: "destructive",
            })
          })
          .finally(() => {
            setSearchingAirports(false)
          })
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [destinationQuery, toast])

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const swapAirports = () => {
    const tempQuery = departureQuery
    const tempAirport = selectedDepartureAirport

    setDepartureQuery(destinationQuery)
    setSelectedDepartureAirport(selectedDestinationAirport)

    setDestinationQuery(tempQuery)
    setSelectedDestinationAirport(tempAirport)
  }

  const startPolling = () => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    setIsPolling(true)

    // Set up polling interval (every 2 seconds)
    pollingIntervalRef.current = setInterval(async () => {
      if (!sessionToken) {
        clearInterval(pollingIntervalRef.current!)
        setIsPolling(false)
        return
      }

      try {
        const response = await fetch("/api/flights/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionToken }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Poll response:", data)

        // Update progress
        setSearchProgress(data.progress || 0)

        // Process results if we should replace the data
        if (data.action === "replace" && data.content) {
          const processedResults = processFlightResults(data)
          if (processedResults.length > 0) {
            setFlightResults(processedResults)

            // Extract unique airlines for filtering
            const uniqueAirlines = Array.from(new Set(processedResults.map((flight) => flight.airline)))
            setAirlines(uniqueAirlines)

            // Update price range based on actual flight prices
            const prices = processedResults.map((flight) => flight.price)
            const minPrice = Math.floor(Math.min(...prices))
            const maxPrice = Math.ceil(Math.max(...prices) * 1.2) // Add 20% buffer to max price
            setPriceRange([minPrice, maxPrice > 2000 ? maxPrice : 2000])
          }
        }

        // Update search status
        setSearchStatus(data.status)

        // Stop polling if search is complete
        if (data.status === "complete" || data.status === "error") {
          clearInterval(pollingIntervalRef.current!)
          setIsPolling(false)

          if (data.status === "complete") {
            toast({
              title: "Search complete",
              description: "All flight results have been loaded",
            })
          } else if (data.status === "error") {
            toast({
              title: "Search error",
              description: data.error || "An error occurred while searching for flights",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error polling for flight results:", error)
        clearInterval(pollingIntervalRef.current!)
        setIsPolling(false)
        setSearchStatus("error")

        toast({
          title: "Polling error",
          description: "Failed to get updated flight results",
          variant: "destructive",
        })
      }
    }, 2000)
  }

  const handleSearch = async () => {
    if (!selectedDepartureAirport || !selectedDestinationAirport || !departureDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Reset search state
    setLoading(true)
    setHasSearched(true)
    setFlightResults([])
    setSessionToken(null)
    setSearchProgress(0)
    setSearchStatus("pending")
    setSelectedFlight(null)

    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    try {
      if (useMockData) {
        // Use mock data for testing
        setLoading(false)
        setSearchStatus("complete")
        setSearchProgress(100)

        const processedResults = mockFlightResults.map((flight) => ({
          ...flight,
          departureAirport: selectedDepartureAirport,
          arrivalAirport: selectedDestinationAirport,
          legs: flight.legs.map((leg) => ({
            ...leg,
            origin: {
              ...leg.origin,
              display_code: selectedDepartureAirport,
            },
            destination: {
              ...leg.destination,
              display_code: selectedDestinationAirport,
            },
          })),
        }))

        setFlightResults(processedResults)

        // Extract unique airlines for filtering
        const uniqueAirlines = Array.from(new Set(processedResults.map((flight) => flight.airline)))
        setAirlines(uniqueAirlines)

        // Update price range based on actual flight prices
        const prices = processedResults.map((flight) => flight.price)
        const minPrice = Math.floor(Math.min(...prices))
        const maxPrice = Math.ceil(Math.max(...prices) * 1.2) // Add 20% buffer to max price
        setPriceRange([minPrice, maxPrice > 2000 ? maxPrice : 2000])

        return
      }

      // Step 1: Create search session
      const searchBody = {
        query: {
          market: "US",
          locale: "en-US",
          currency: "USD",
          queryLegs: [
            {
              originPlaceId: { iata: selectedDepartureAirport },
              destinationPlaceId: { iata: selectedDestinationAirport },
              date: {
                year: departureDate.getFullYear(),
                month: departureDate.getMonth() + 1,
                day: departureDate.getDate(),
              },
            },
          ],
          adults: passengers,
          cabinClass: `CABIN_CLASS_${cabinClass.toUpperCase()}`,
          includeSustainabilityData: true,
        },
      }

      // Add return leg if round trip
      if (isRoundTrip && returnDate) {
        searchBody.query.queryLegs.push({
          originPlaceId: { iata: selectedDestinationAirport },
          destinationPlaceId: { iata: selectedDepartureAirport },
          date: {
            year: returnDate.getFullYear(),
            month: returnDate.getMonth() + 1,
            day: returnDate.getDate(),
          },
        })
      }

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Initial search response:", data)

      // Save the session token for polling
      if (data.sessionToken) {
        setSessionToken(data.sessionToken)
      }

      // Update progress
      setSearchProgress(data.progress || 0)

      // Update search status
      setSearchStatus(data.status)

      // Process the initial results
      const processedResults = processFlightResults(data)

      if (processedResults.length > 0) {
        setFlightResults(processedResults)

        // Extract unique airlines for filtering
        const uniqueAirlines = Array.from(new Set(processedResults.map((flight) => flight.airline)))
        setAirlines(uniqueAirlines)

        // Update price range based on actual flight prices
        if (processedResults.length > 0) {
          const prices = processedResults.map((flight) => flight.price)
          const minPrice = Math.floor(Math.min(...prices))
          const maxPrice = Math.ceil(Math.max(...prices) * 1.2) // Add 20% buffer to max price
          setPriceRange([minPrice, maxPrice > 2000 ? maxPrice : 2000])
        }
      } else if (data.status !== "pending") {
        // Fallback to mock data if no results and not pending
        toast({
          title: "Using demo data",
          description: "No flights found in API, showing sample results",
        })
        setUseMockData(true)

        // Use mock data with the selected airports
        const modifiedMockResults = mockFlightResults.map((flight) => ({
          ...flight,
          departureAirport: selectedDepartureAirport,
          arrivalAirport: selectedDestinationAirport,
          legs: flight.legs.map((leg) => ({
            ...leg,
            origin: {
              ...leg.origin,
              display_code: selectedDepartureAirport,
            },
            destination: {
              ...leg.destination,
              display_code: selectedDestinationAirport,
            },
          })),
        }))

        setFlightResults(modifiedMockResults)

        // Extract unique airlines for filtering
        const uniqueAirlines = Array.from(new Set(modifiedMockResults.map((flight) => flight.airline)))
        setAirlines(uniqueAirlines)
      }

      // Start polling if the search is still pending
      if (data.status === "pending" && data.sessionToken) {
        startPolling()
      }
    } catch (error) {
      console.error("Error searching flights:", error)
      setSearchStatus("error")

      // Fallback to mock data on error
      toast({
        title: "Using demo data",
        description: "Error connecting to flight API, showing sample results",
      })

      setUseMockData(true)

      // Use mock data with the selected airports
      const modifiedMockResults = mockFlightResults.map((flight) => ({
        ...flight,
        departureAirport: selectedDepartureAirport,
        arrivalAirport: selectedDestinationAirport,
        legs: flight.legs.map((leg) => ({
          ...leg,
          origin: {
            ...leg.origin,
            display_code: selectedDepartureAirport,
          },
          destination: {
            ...leg.destination,
            display_code: selectedDestinationAirport,
          },
        })),
      }))

      setFlightResults(modifiedMockResults)

      // Extract unique airlines for filtering
      const uniqueAirlines = Array.from(new Set(modifiedMockResults.map((flight) => flight.airline)))
      setAirlines(uniqueAirlines)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date time
  function formatDateTime(year: number, month: number, day: number, hour: number, minute: number): string {
    const date = new Date(year, month - 1, day, hour, minute)
    return date.toISOString()
  }

  // Helper function to format time
  function formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  const processFlightResults = (data: any): FlightResult[] => {
    try {
      console.log("Processing flight results:", data)

      // Check if we have the expected data structure
      if (!data || !data.content || !data.content.results) {
        console.warn("Unexpected API response structure:", data)
        return []
      }

      // Extract the necessary data from the response
      const { itineraries, legs, segments, places, carriers, agents } = data.content.results

      if (!itineraries) {
        console.warn("No itineraries found in API response")
        return []
      }

      // Process itineraries to get prices and flight details
      return Object.entries(itineraries)
        .map(([id, itinerary]: [string, any]) => {
          try {
            // Get the cheapest pricing option
            const pricingOptions = itinerary.pricingOptions || []
            if (pricingOptions.length === 0) {
              throw new Error("No pricing options available")
            }

            const cheapestPrice = pricingOptions.reduce(
              (min: any, option: any) => (option.price.amount < min.price.amount ? option : min),
              pricingOptions[0],
            )

            // Process leg information
            const legIds = itinerary.legIds || []
            const processedLegs = legIds
              .map((legId: string) => {
                const leg = legs[legId]
                if (!leg) return null

                // Get carrier information
                const carrierNames = leg.segmentIds
                  .map((segId: string) => {
                    const segment = segments[segId]
                    const carrier = carriers[segment?.marketingCarrierId]
                    return carrier?.name || "Unknown Airline"
                  })
                  .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

                // Get flight numbers
                const flightNumbers = leg.segmentIds
                  .map((segId: string) => {
                    const segment = segments[segId]
                    return segment ? `${segment.marketingCarrierCode}${segment.flightNumber}` : ""
                  })
                  .filter(Boolean)

                // Get origin and destination information
                const origin = places[leg.originPlaceId]
                const destination = places[leg.destinationPlaceId]

                return {
                  id: leg.id,
                  carrier: carrierNames.join(" + "),
                  flightNumber: flightNumbers.join(", "),
                  origin: {
                    code: origin?.entityId?.split(":")[1] || leg.originPlaceId,
                    name: origin?.name || "Origin Airport",
                    display_code: origin?.entityId?.split(":")[1] || leg.originPlaceId,
                  },
                  destination: {
                    code: destination?.entityId?.split(":")[1] || leg.destinationPlaceId,
                    name: destination?.name || "Destination Airport",
                    display_code: destination?.entityId?.split(":")[1] || leg.destinationPlaceId,
                  },
                  departureDateTime: formatDateTime(
                    leg.departureDateTime.year,
                    leg.departureDateTime.month,
                    leg.departureDateTime.day,
                    leg.departureDateTime.hour,
                    leg.departureDateTime.minute,
                  ),
                  arrivalDateTime: formatDateTime(
                    leg.arrivalDateTime.year,
                    leg.arrivalDateTime.month,
                    leg.arrivalDateTime.day,
                    leg.arrivalDateTime.hour,
                    leg.arrivalDateTime.minute,
                  ),
                  departure: formatTime(leg.departureDateTime.hour, leg.departureDateTime.minute),
                  arrival: formatTime(leg.arrivalDateTime.hour, leg.arrivalDateTime.minute),
                  duration: formatDuration(leg.durationInMinutes),
                  durationInMinutes: leg.durationInMinutes,
                  stops: leg.stopCount,
                }
              })
              .filter(Boolean)

            if (processedLegs.length === 0) {
              throw new Error("No valid legs found")
            }

            // Get price information
            const price = cheapestPrice.price.amount / (cheapestPrice.price.unit === "PRICE_UNIT_MILLI" ? 1000 : 1)
            const currency = cheapestPrice.price.currency || "USD"

            // Get agent information
            const agentIds = cheapestPrice.agentIds || []
            const bookingLinks =
              cheapestPrice.items?.map((item: any) => ({
                agentId: item.agentId,
                deepLink: item.deepLink,
              })) || []

            // Determine if this is a multi-booking flight
            const isMultiBooking = bookingLinks.length > 1

            // Get transfer type
            let transferType = TransferType.UNSPECIFIED
            if (cheapestPrice.transferType) {
              transferType = cheapestPrice.transferType
            }

            // Determine mashup type
            let mashupType = MashupType.NONE
            if (isMultiBooking && transferType === TransferType.SELF_TRANSFER) {
              mashupType = legIds.length > 1 ? MashupType.SUM_OF_ONE_WAY : MashupType.NON_PROTECTED_SELF_TRANSFER
            }

            const firstLeg = processedLegs[0]

            return {
              id: `flight-${id}-${Date.now()}`,
              airline: firstLeg.carrier,
              flightNumber: firstLeg.flightNumber,
              departureAirport: firstLeg.origin.display_code,
              departureTime: firstLeg.departure,
              arrivalAirport: firstLeg.destination.display_code,
              arrivalTime: firstLeg.arrival,
              duration: firstLeg.duration,
              stops: firstLeg.stops,
              price: price,
              currency: currency,
              deepLink: bookingLinks.length === 1 ? bookingLinks[0].deepLink : "",
              legs: processedLegs,
              transferType,
              agentIds: agentIds,
              bookingLinks,
              isMultiBooking,
              mashupType,
            }
          } catch (error) {
            console.error("Error processing individual itinerary:", error)
            return null
          }
        })
        .filter(Boolean)
    } catch (error) {
      console.error("Error processing flight results:", error)
      return []
    }
  }

  const formatDuration = (minutes: number): string => {
    if (!minutes || isNaN(minutes)) return "0h 0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const saveFlight = (flight: FlightResult) => {
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

  const toggleAirline = (airline: string) => {
    if (selectedAirlines.includes(airline)) {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline))
    } else {
      setSelectedAirlines([...selectedAirlines, airline])
    }
  }

  const getTransferTypeInfo = (flight: FlightResult) => {
    // For mashups, provide specific information
    if (flight.mashupType === MashupType.SUM_OF_ONE_WAY) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        label: "Sum of One-Way (Mashup)",
        description:
          "This is a Sum-of-One-Way mashup. You'll need to make separate bookings for each leg of your journey. If something goes wrong with one flight, the other airline is not obligated to accommodate you.",
        color: "text-amber-500",
        badgeVariant: "warning" as const,
      }
    } else if (flight.mashupType === MashupType.NON_PROTECTED_SELF_TRANSFER) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        label: "Non-Protected Self-Transfer (Mashup)",
        description:
          "This is a Non-Protected Self-Transfer mashup. You'll need to collect your baggage and check in again at your connection point. If you miss your connection, you'll need to buy a new ticket.",
        color: "text-red-500",
        badgeVariant: "destructive" as const,
      }
    }

    // For regular transfer types
    switch (flight.transferType) {
      case TransferType.MANAGED:
        return {
          icon: <ShieldCheck className="h-4 w-4 text-green-500" />,
          label: "Protected Transfer",
          description:
            "This is a protected transfer managed by the agent. If you miss a connection due to delays, the agent will find alternatives at no extra cost.",
          color: "text-green-500",
          badgeVariant: "outline" as const,
        }
      case TransferType.PROTECTED_SELF_TRANSFER:
        return {
          icon: <Shield className="h-4 w-4 text-amber-500" />,
          label: "OTA Virtual Interline",
          description:
            "This is an OTA Virtual Interline. The travel agent offers some protection if things go wrong, but you'll need to collect and re-check your baggage between flights. Contact the OTA directly if you experience delays or cancellations.",
          color: "text-amber-500",
          badgeVariant: "outline" as const,
        }
      case TransferType.SELF_TRANSFER:
        return {
          icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
          label: "Non-Protected Self-Transfer",
          description:
            "This is a non-protected self-transfer. You'll have multiple booking references and will need to collect and re-check your baggage. If you miss a connection, you'll need to buy a new ticket.",
          color: "text-red-500",
          badgeVariant: "destructive" as const,
        }
      default:
        return {
          icon: <Info className="h-4 w-4 text-blue-500" />,
          label: "Transfer Type Unspecified",
          description: "The transfer type for this flight is not specified. Please check with the agent for details.",
          color: "text-blue-500",
          badgeVariant: "secondary" as const,
        }
    }
  }

  const handleBookFlight = (flight: FlightResult) => {
    setSelectedFlight(flight)
  }

  const filteredResults = flightResults
    .filter((flight) => {
      // Filter by mashup
      if (!showMashups && flight.mashupType !== MashupType.NONE) return false

      // Filter by price
      if (flight.price < priceRange[0] || flight.price > priceRange[1]) return false

      // Filter by stops
      if (maxStops !== null && flight.stops > maxStops) return false

      // Filter by airlines
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) return false

      // Filter by departure time
      if (departureTime !== "any") {
        const hour = Number.parseInt(flight.departureTime.split(":")[0])
        if (departureTime === "morning" && (hour < 6 || hour >= 12)) return false
        if (departureTime === "afternoon" && (hour < 12 || hour >= 18)) return false
        if (departureTime === "evening" && (hour < 18 || hour >= 24)) return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price
      if (sortBy === "duration") {
        const durationA = a.duration.split("h")[0]
        const durationB = b.duration.split("h")[0]
        return Number.parseInt(durationA) - Number.parseInt(durationB)
      }
      if (sortBy === "departure") {
        const hourA = Number.parseInt(a.departureTime.split(":")[0])
        const hourB = Number.parseInt(b.departureTime.split(":")[0])
        return hourA - hourB
      }
      return 0
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Search Form */}
      <div className="lg:col-span-4">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Don't know where to go?</h3>
                  <p className="text-sm opacity-90">
                    Play our match game to discover destinations that fit your preferences!
                  </p>
                </div>
                <Button variant="secondary" className="whitespace-nowrap" onClick={() => router.push("/match-game")}>
                  Find My Match
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="round-trip" className="cursor-pointer">
                  Round Trip
                </Label>
                <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
              </div>

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

              <div className="flex items-center gap-2">
                <Label htmlFor="use-mock-data" className="cursor-pointer">
                  Use Demo Data
                </Label>
                <Switch id="use-mock-data" checked={useMockData} onCheckedChange={setUseMockData} />
              </div>

              <Button variant="outline" size="icon" className="ml-2" onClick={swapAirports} title="Swap Airports">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Label htmlFor="departure" className="mb-2 block">
                  From
                </Label>
                <div className="relative">
                  <Input
                    id="departure"
                    placeholder="City or airport"
                    value={departureQuery}
                    onChange={(e) => setDepartureQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {departureQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        setDepartureQuery("")
                        setSelectedDepartureAirport("")
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {departureAirports.length > 0 && departureQuery.length >= 2 && !selectedDepartureAirport && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul>
                      {departureAirports.map((airport) => (
                        <li
                          key={airport.entityId}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedDepartureAirport(airport.iata)
                            setDepartureQuery(`${airport.name} (${airport.iata})`)
                            setDepartureAirports([]) // This line ensures the dropdown disappears
                          }}
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
                <Label htmlFor="destination" className="mb-2 block">
                  To
                </Label>
                <div className="relative">
                  <Input
                    id="destination"
                    placeholder="City or airport"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {destinationQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        setDestinationQuery("")
                        setSelectedDestinationAirport("")
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {destinationAirports.length > 0 && destinationQuery.length >= 2 && !selectedDestinationAirport && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    <ul>
                      {destinationAirports.map((airport) => (
                        <li
                          key={airport.entityId}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedDestinationAirport(airport.iata)
                            setDestinationQuery(`${airport.name} (${airport.iata})`)
                            setDestinationAirports([]) // This line ensures the dropdown disappears
                          }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="mb-2 block">Departure Date</Label>
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
                      {departureDate ? format(departureDate, "EEE, MMM d, yyyy") : "Select date"}
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

              {isRoundTrip && (
                <div>
                  <Label className="mb-2 block">Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !returnDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "EEE, MMM d, yyyy") : "Select date"}
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
              )}
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search Flights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results and Filters */}
      {hasSearched && (
        <>
          {/* Search Progress */}
          {searchStatus === "pending" && (
            <div className="lg:col-span-4 mb-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Loading flight results...</span>
                        <span className="text-sm font-medium">{searchProgress}%</span>
                      </div>
                      <Progress value={searchProgress} className="h-2" />
                    </div>
                    {isPolling ? (
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Button variant="outline" size="sm" onClick={startPolling} disabled={!sessionToken}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    We're searching across multiple airlines. The best prices often come from slower partners, so please
                    wait for all results.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 2000]}
                      max={2000}
                      step={50}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Stops</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nonstop"
                        checked={maxStops === 0}
                        onCheckedChange={(checked) => setMaxStops(checked ? 0 : null)}
                      />
                      <label
                        htmlFor="nonstop"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Nonstop only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="max-1-stop"
                        checked={maxStops === 1}
                        onCheckedChange={(checked) => setMaxStops(checked ? 1 : null)}
                      />
                      <label
                        htmlFor="max-1-stop"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Max 1 stop
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="any-stops"
                        checked={maxStops === null}
                        onCheckedChange={(checked) => setMaxStops(checked ? null : 2)}
                      />
                      <label
                        htmlFor="any-stops"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Any number of stops
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Airlines</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {airlines.map((airline) => (
                      <div key={airline} className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline}`}
                          checked={selectedAirlines.length === 0 || selectedAirlines.includes(airline)}
                          onCheckedChange={() => toggleAirline(airline)}
                        />
                        <label
                          htmlFor={`airline-${airline}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {airline}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Departure Time</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="any-time"
                        checked={departureTime === "any"}
                        onCheckedChange={(checked) => checked && setDepartureTime("any")}
                      />
                      <label
                        htmlFor="any-time"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Any time
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="morning"
                        checked={departureTime === "morning"}
                        onCheckedChange={(checked) => checked && setDepartureTime("morning")}
                      />
                      <label
                        htmlFor="morning"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Morning (6AM - 12PM)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="afternoon"
                        checked={departureTime === "afternoon"}
                        onCheckedChange={(checked) => checked && setDepartureTime("afternoon")}
                      />
                      <label
                        htmlFor="afternoon"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Afternoon (12PM - 6PM)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="evening"
                        checked={departureTime === "evening"}
                        onCheckedChange={(checked) => checked && setDepartureTime("evening")}
                      />
                      <label
                        htmlFor="evening"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Evening (After 6PM)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Booking Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-mashups"
                        checked={showMashups}
                        onCheckedChange={(checked) => setShowMashups(checked as boolean)}
                      />
                      <label
                        htmlFor="show-mashups"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Show Mashup Flights
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Mashups are flights that require multiple bookings. They can be cheaper but carry
                              additional risks if something goes wrong.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price (Lowest first)</SelectItem>
                      <SelectItem value="duration">Duration (Shortest first)</SelectItem>
                      <SelectItem value="departure">Departure (Earliest first)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle>Flight Results</CardTitle>
                    <CardDescription>
                      {filteredResults.length} flights found from {selectedDepartureAirport} to{" "}
                      {selectedDestinationAirport}
                      {searchStatus === "pending" && " (more results loading...)"}
                    </CardDescription>
                  </div>
                  <BookingTypeExplainer />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      {searchStatus === "pending"
                        ? "Searching for flights... Please wait."
                        : "No flights found matching your criteria."}
                    </p>
                    {searchStatus !== "pending" && (
                      <Button
                        className="mt-4"
                        onClick={() => {
                          setMaxStops(null)
                          setSelectedAirlines([])
                          setDepartureTime("any")
                          setPriceRange([0, 2000])
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {filteredResults.map((flight) => {
                        const transferInfo = getTransferTypeInfo(flight)
                        return (
                          <Card key={flight.id} className="overflow-hidden">
                            <div className="p-4 border-b bg-muted/30">
                              <div className="flex justify-between items-center">
                                <div className="font-medium flex items-center">
                                  <span className="font-bold mr-2">{flight.airline}</span>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Plane className="h-3 w-3" />
                                    <span>{flight.flightNumber}</span>
                                  </Badge>
                                  {flight.agentIds && flight.agentIds.length > 0 && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      via{" "}
                                      {flight.agentIds
                                        .map((agent) => agent.charAt(0).toUpperCase() + agent.slice(1))
                                        .join(", ")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-lg font-bold text-primary">
                                  {formatPrice(flight.price, flight.currency)}
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                <div className="flex flex-col items-start">
                                  <div className="text-2xl font-bold">{flight.departureTime}</div>
                                  <div className="text-sm text-muted-foreground">{flight.departureAirport}</div>
                                  <div className="text-xs text-muted-foreground">{flight.legs[0].origin.name}</div>
                                </div>

                                <div className="flex flex-col items-center my-2 md:my-0">
                                  <div className="text-xs text-muted-foreground">{flight.duration}</div>
                                  <div className="flex items-center w-24 md:w-40">
                                    <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                                    <Plane className="h-3 w-3 mx-1 text-muted-foreground transform rotate-90" />
                                    <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {flight.stops === 0 ? (
                                      <Badge variant="outline" className="text-xs">
                                        Nonstop
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        {flight.stops} {flight.stops === 1 ? "stop" : "stops"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end">
                                  <div className="text-2xl font-bold">{flight.arrivalTime}</div>
                                  <div className="text-sm text-muted-foreground">{flight.arrivalAirport}</div>
                                  <div className="text-xs text-muted-foreground">{flight.legs[0].destination.name}</div>
                                </div>
                              </div>

                              {/* Transfer Type Information */}
                              <div className="mb-4">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-help">
                                        {transferInfo.icon}
                                        <Badge
                                          variant={transferInfo.badgeVariant}
                                          className={`text-xs ${transferInfo.color}`}
                                        >
                                          {transferInfo.label}
                                        </Badge>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{transferInfo.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              {/* Multi-booking warning */}
                              {flight.isMultiBooking && (
                                <Alert variant="warning" className="mb-4">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertTitle>Multiple bookings required</AlertTitle>
                                  <AlertDescription>
                                    This itinerary requires {flight.bookingLinks?.length} separate bookings. You must
                                    complete all bookings to secure your entire journey.
                                  </AlertDescription>
                                </Alert>
                              )}

                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
                                <div className="flex items-center">
                                  <Badge variant="outline" className="mr-2">
                                    {flight.flightNumber}
                                  </Badge>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {flight.duration}
                                  </div>
                                </div>

                                <div className="flex gap-2">
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

                                  <Button onClick={() => handleBookFlight(flight)}>Book Flight</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Booking Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Complete Your Booking</CardTitle>
              <CardDescription>
                {selectedFlight.departureAirport} to {selectedFlight.arrivalAirport} on{" "}
                {departureDate && format(departureDate, "EEE, MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Flight Summary */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Flight Details</h3>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex flex-col items-start">
                      <div className="text-xl font-bold">{selectedFlight.departureTime}</div>
                      <div className="text-sm text-muted-foreground">{selectedFlight.departureAirport}</div>
                      <div className="text-xs text-muted-foreground">{selectedFlight.legs[0].origin.name}</div>
                    </div>

                    <div className="flex flex-col items-center my-2 md:my-0">
                      <div className="text-xs text-muted-foreground">{selectedFlight.duration}</div>
                      <div className="flex items-center w-24 md:w-40">
                        <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                        <Plane className="h-3 w-3 mx-1 text-muted-foreground transform rotate-90" />
                        <div className="h-[2px] flex-1 bg-muted-foreground"></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedFlight.stops === 0 ? (
                          <Badge variant="outline" className="text-xs">
                            Nonstop
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {selectedFlight.stops} {selectedFlight.stops === 1 ? "stop" : "stops"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="text-xl font-bold">{selectedFlight.arrivalTime}</div>
                      <div className="text-sm text-muted-foreground">{selectedFlight.arrivalAirport}</div>
                      <div className="text-xs text-muted-foreground">{selectedFlight.legs[0].destination.name}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge variant="outline">{selectedFlight.airline}</Badge>
                      <span className="text-sm ml-2">{selectedFlight.flightNumber}</span>
                      {selectedFlight.agentIds && selectedFlight.agentIds.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Booking via:{" "}
                          {selectedFlight.agentIds
                            .map((agent) => agent.charAt(0).toUpperCase() + agent.slice(1))
                            .join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      {formatPrice(selectedFlight.price, selectedFlight.currency)}
                    </div>
                  </div>
                </div>

                {/* Mashup Type Information */}
                {selectedFlight.mashupType === MashupType.SUM_OF_ONE_WAY && (
                  <Alert variant="warning" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Sum of One-Way Mashup</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        This is a Sum-of-One-Way mashup. You'll need to make separate bookings for each leg of your
                        journey.
                      </p>
                      <p className="font-medium">
                        Important: If something goes wrong with one flight (like delays or cancellations), the other
                        airline is not obligated to accommodate you. We recommend checking all booking links for
                        availability before making any purchases.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {selectedFlight.mashupType === MashupType.NON_PROTECTED_SELF_TRANSFER && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Non-Protected Self-Transfer Mashup</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        This is a Non-Protected Self-Transfer mashup. You'll need to collect your baggage and check in
                        again at your connection point.
                      </p>
                      <p className="font-medium">
                        Important: If you miss your connection, you'll need to buy a new ticket. There is no protection
                        between flights. We strongly recommend allowing plenty of time between connections and checking
                        all booking links for availability before making any purchases.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Transfer Type Information */}
                {selectedFlight.transferType && selectedFlight.mashupType === MashupType.NONE && (
                  <Alert variant={selectedFlight.transferType === TransferType.MANAGED ? "default" : "warning"}>
                    <div className="flex items-center gap-2">
                      {selectedFlight.transferType === TransferType.MANAGED ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : selectedFlight.transferType === TransferType.PROTECTED_SELF_TRANSFER ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <ShieldAlert className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {selectedFlight.transferType === TransferType.MANAGED
                          ? "Protected Transfer"
                          : selectedFlight.transferType === TransferType.PROTECTED_SELF_TRANSFER
                            ? "OTA Virtual Interline"
                            : "Non-Protected Self-Transfer"}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      {selectedFlight.transferType === TransferType.MANAGED
                        ? "This is a protected transfer managed by the agent. If you miss a connection due to delays, the agent will find alternatives at no extra cost."
                        : selectedFlight.transferType === TransferType.PROTECTED_SELF_TRANSFER
                          ? "This is an OTA Virtual Interline booking. The travel agent offers some protection if things go wrong. You'll need to collect and re-check your baggage between flights. If you experience delays or cancellations, contact the travel agent directly (not the airlines) for assistance with rebooking."
                          : "This is a non-protected self-transfer. You'll have multiple booking references and will need to collect and re-check your baggage. If you miss a connection, you'll need to buy a new ticket."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Multiple Booking Warning */}
                {selectedFlight.isMultiBooking && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Multiple Bookings Required</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        This itinerary requires {selectedFlight.bookingLinks?.length} separate bookings. You must
                        complete all bookings to secure your entire journey.
                      </p>
                      <p className="font-medium">
                        We highly recommend opening all booking links first before making any purchases to ensure
                        availability for all parts of your journey.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Booking Links */}
                <div>
                  <h3 className="font-medium mb-2">Complete Your Booking</h3>
                  {selectedFlight.isMultiBooking ? (
                    <div className="space-y-3">
                      {selectedFlight.bookingLinks?.map((link, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium">Booking {index + 1}</div>
                            <div className="text-sm text-muted-foreground">Provider: {link.agentId}</div>
                          </div>
                          <Button asChild>
                            <a href={link.deepLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open Booking
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Button className="w-full" asChild>
                      <a href={selectedFlight.deepLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Continue to Booking
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedFlight(null)}>
                Cancel
              </Button>
              {!selectedFlight.isMultiBooking && (
                <Button asChild>
                  <a href={selectedFlight.deepLink} target="_blank" rel="noopener noreferrer">
                    Book Now
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

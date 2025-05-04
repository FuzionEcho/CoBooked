// Types for search results
export interface FlightSearchResult {
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
}

export interface HotelSearchResult {
  id: string
  name: string
  address: string
  stars: number
  price: number
  currency: string
  amenities: string[]
  imageUrl: string
  description: string
  rating: number
  reviewCount: number
}

export interface ActivitySearchResult {
  id: string
  name: string
  category: string
  price: number
  currency: string
  duration: string
  rating: number
  reviewCount: number
  imageUrl: string
  description: string
  location: string
}

// Flight search service
export async function searchFlights(params: {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults: number
  children?: number
  cabinClass?: string
}): Promise<FlightSearchResult[]> {
  try {
    // First try to use the real API
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    // If we got valid data from the API, parse and return it
    if (data && !data.error && data.content?.results?.itineraries) {
      // Parse the real API response
      return parseRealFlightResults(data)
    }

    // If the API failed or returned invalid data, use mock data
    return generateMockFlightResults(params)
  } catch (error) {
    console.error("Error searching flights:", error)
    // Return mock data as fallback
    return generateMockFlightResults(params)
  }
}

// Hotel search service
export async function searchHotels(params: {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  rooms?: number
  minStars?: number
  maxPrice?: number
}): Promise<HotelSearchResult[]> {
  try {
    // In a real app, this would call an actual hotel API
    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 800))
    return generateMockHotelResults(params)
  } catch (error) {
    console.error("Error searching hotels:", error)
    return []
  }
}

// Activity search service
export async function searchActivities(params: {
  destination: string
  date?: string
  category?: string
  maxPrice?: number
}): Promise<ActivitySearchResult[]> {
  try {
    // In a real app, this would call an actual activities API
    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 600))
    return generateMockActivityResults(params)
  } catch (error) {
    console.error("Error searching activities:", error)
    return []
  }
}

// Helper function to parse real flight API results
function parseRealFlightResults(data: any): FlightSearchResult[] {
  // This would need to be customized based on the actual Skyscanner API response format
  try {
    return data.content.results.itineraries.map((itinerary: any, index: number) => ({
      id: `flight-${index}`,
      airline: itinerary.legs[0].carriers[0].name,
      flightNumber: `${itinerary.legs[0].carriers[0].code}${Math.floor(Math.random() * 1000) + 100}`,
      departureAirport: itinerary.legs[0].origin.display_code,
      departureTime: itinerary.legs[0].departure,
      arrivalAirport: itinerary.legs[0].destination.display_code,
      arrivalTime: itinerary.legs[0].arrival,
      duration: formatDuration(itinerary.legs[0].durationInMinutes),
      stops: itinerary.legs[0].stops.length,
      price: itinerary.price.amount,
      currency: itinerary.price.currency,
    }))
  } catch (error) {
    console.error("Error parsing flight results:", error)
    return []
  }
}

// Mock data generators
function generateMockFlightResults(params: any): FlightSearchResult[] {
  const airlines = [
    "United Airlines",
    "Delta",
    "American Airlines",
    "British Airways",
    "Lufthansa",
    "Air France",
    "Emirates",
    "Singapore Airlines",
  ]
  const airlineCodes = ["UA", "DL", "AA", "BA", "LH", "AF", "EK", "SQ"]

  const basePrice = Math.floor(Math.random() * 300) + 200
  const results: FlightSearchResult[] = []

  for (let i = 0; i < 8; i++) {
    const airlineIndex = Math.floor(Math.random() * airlines.length)
    const departureHour = Math.floor(Math.random() * 24)
    const durationHours = Math.floor(Math.random() * 5) + 2
    const durationMinutes = Math.floor(Math.random() * 60)

    const arrivalHour = (departureHour + durationHours) % 24
    const stops = Math.floor(Math.random() * 3)

    results.push({
      id: `flight-${i}`,
      airline: airlines[airlineIndex],
      flightNumber: `${airlineCodes[airlineIndex]}${Math.floor(Math.random() * 1000) + 100}`,
      departureAirport: params.origin,
      departureTime: `${departureHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      arrivalAirport: params.destination,
      arrivalTime: `${arrivalHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      duration: `${durationHours}h ${durationMinutes}m`,
      stops,
      price: basePrice + i * 50 + Math.floor(Math.random() * 100) - (stops === 0 ? 0 : stops * 30),
      currency: "USD",
    })
  }

  // Sort by price
  return results.sort((a, b) => a.price - b.price)
}

function generateMockHotelResults(params: any): HotelSearchResult[] {
  const hotelNames = [
    "Grand Hotel",
    "Seaside Resort",
    "City Center Suites",
    "Mountain View Lodge",
    "Riverside Inn",
    "Plaza Hotel",
    "Ocean Breeze Resort",
    "Metropolitan Hotel",
    "Heritage Hotel",
    "Sunset Beach Resort",
  ]

  const amenities = [
    "Free WiFi",
    "Swimming Pool",
    "Fitness Center",
    "Restaurant",
    "Bar",
    "Spa",
    "Room Service",
    "Parking",
    "Airport Shuttle",
    "Business Center",
    "Laundry Service",
    "Pet Friendly",
  ]

  const results: HotelSearchResult[] = []

  for (let i = 0; i < 10; i++) {
    const stars = Math.floor(Math.random() * 3) + 3
    const basePrice = stars * 50 + Math.floor(Math.random() * 100)
    const hotelAmenities = []

    // Randomly select 3-6 amenities
    const numAmenities = Math.floor(Math.random() * 4) + 3
    for (let j = 0; j < numAmenities; j++) {
      const amenity = amenities[Math.floor(Math.random() * amenities.length)]
      if (!hotelAmenities.includes(amenity)) {
        hotelAmenities.push(amenity)
      }
    }

    results.push({
      id: `hotel-${i}`,
      name: `${hotelNames[i % hotelNames.length]} ${params.destination}`,
      address: `${Math.floor(Math.random() * 1000) + 1} Main Street, ${params.destination}`,
      stars,
      price: basePrice,
      currency: "USD",
      amenities: hotelAmenities,
      imageUrl: `/placeholder.svg?height=200&width=300&query=hotel in ${params.destination}`,
      description: `Enjoy your stay at this beautiful ${stars}-star hotel in the heart of ${params.destination}.`,
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 1000) + 50,
    })
  }

  // Sort by price
  return results.sort((a, b) => a.price - b.price)
}

function generateMockActivityResults(params: any): ActivitySearchResult[] {
  const activityTypes = [
    "Sightseeing Tour",
    "Museum Visit",
    "Adventure Activity",
    "Food Tour",
    "Cultural Experience",
    "Nature Excursion",
    "Historical Tour",
    "Water Activity",
    "Workshop",
    "Entertainment",
  ]

  const durations = ["2 hours", "3 hours", "Half-day", "Full-day", "90 minutes", "4 hours"]

  const results: ActivitySearchResult[] = []

  for (let i = 0; i < 12; i++) {
    const category = activityTypes[i % activityTypes.length]
    const basePrice = Math.floor(Math.random() * 100) + 20

    results.push({
      id: `activity-${i}`,
      name: `${category} in ${params.destination}`,
      category,
      price: basePrice,
      currency: "USD",
      duration: durations[Math.floor(Math.random() * durations.length)],
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 500) + 10,
      imageUrl: `/placeholder.svg?height=200&width=300&query=${category} in ${params.destination}`,
      description: `Experience the best of ${params.destination} with this amazing ${category.toLowerCase()}.`,
      location: `${params.destination} City Center`,
    })
  }

  // Sort by rating (descending)
  return results.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
}

// Helper function to format duration in minutes to a readable string (e.g. 125 -> "2h 5m")
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

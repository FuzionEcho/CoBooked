// Enhanced destination data with more realistic options and flight information

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  imageUrl: string
  bestTimeToVisit: string
  averagePrice: number
  flightTime: string
  tags: string[]
  iataCode?: string // Airport code for flight searches
}

export interface FlightData {
  airline: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: number
  price: number
}

// Expanded list of popular destinations with more detailed information
export const destinations: Destination[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    description: "The City of Light offers iconic landmarks, world-class cuisine, and romantic ambiance.",
    imageUrl: "/paris-eiffel-cityscape.png",
    bestTimeToVisit: "April to June, September to October",
    averagePrice: 150,
    flightTime: "7-8 hours from East Coast",
    tags: ["Romantic", "Cultural", "Food", "Architecture"],
    iataCode: "CDG",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    description: "A fascinating blend of ultramodern and traditional, from neon-lit skyscrapers to historic temples.",
    imageUrl: "/tokyo-fuji-skyline.png",
    bestTimeToVisit: "March to May, September to November",
    averagePrice: 120,
    flightTime: "14-16 hours from US",
    tags: ["Technology", "Food", "Shopping", "Culture"],
    iataCode: "HND",
  },
  {
    id: "newyork",
    name: "New York",
    country: "USA",
    description: "The Big Apple offers world-famous attractions, diverse neighborhoods, and endless entertainment.",
    imageUrl: "/nyc-night-skyline.png",
    bestTimeToVisit: "April to June, September to November",
    averagePrice: 200,
    flightTime: "Varies by location",
    tags: ["Urban", "Shopping", "Arts", "Food"],
    iataCode: "JFK",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description: "A tropical paradise with beautiful beaches, lush rice terraces, and spiritual temples.",
    imageUrl: "/placeholder.svg?key=n4yj2",
    bestTimeToVisit: "April to October",
    averagePrice: 80,
    flightTime: "20+ hours from US",
    tags: ["Beach", "Nature", "Spiritual", "Adventure"],
    iataCode: "DPS",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    description: "The Eternal City is a living museum of ancient history, art, and delicious cuisine.",
    imageUrl: "/placeholder.svg?key=3ooyw",
    bestTimeToVisit: "April to June, September to October",
    averagePrice: 130,
    flightTime: "8-10 hours from East Coast",
    tags: ["History", "Food", "Art", "Architecture"],
    iataCode: "FCO",
  },
  {
    id: "cancun",
    name: "Cancun",
    country: "Mexico",
    description: "Crystal clear waters, white sand beaches, and vibrant nightlife make this a popular destination.",
    imageUrl: "/placeholder.svg?key=oao72",
    bestTimeToVisit: "December to April",
    averagePrice: 100,
    flightTime: "3-5 hours from US",
    tags: ["Beach", "Nightlife", "All-Inclusive", "Water Sports"],
    iataCode: "CUN",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    description: "A dynamic city blending history and modernity with iconic landmarks and diverse culture.",
    imageUrl: "/placeholder.svg?key=2oi7r",
    bestTimeToVisit: "May to September",
    averagePrice: 160,
    flightTime: "7-8 hours from East Coast",
    tags: ["History", "Shopping", "Arts", "Urban"],
    iataCode: "LHR",
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    description: "Stunning harbor, iconic Opera House, and beautiful beaches in a vibrant cosmopolitan setting.",
    imageUrl: "/sydney-opera-house-bridge.png",
    bestTimeToVisit: "September to November, March to May",
    averagePrice: 140,
    flightTime: "20+ hours from US",
    tags: ["Beach", "Urban", "Nature", "Architecture"],
    iataCode: "SYD",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    country: "Spain",
    description: "Unique architecture, vibrant street life, and beautiful beaches make this city unforgettable.",
    imageUrl: "/placeholder.svg?key=xreom",
    bestTimeToVisit: "May to June, September to October",
    averagePrice: 120,
    flightTime: "8-9 hours from East Coast",
    tags: ["Architecture", "Beach", "Food", "Nightlife"],
    iataCode: "BCN",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    description: "Futuristic skyline, luxury shopping, and desert adventures in this ultramodern city.",
    imageUrl: "/placeholder.svg?key=keqwm",
    bestTimeToVisit: "November to March",
    averagePrice: 180,
    flightTime: "12-14 hours from US",
    tags: ["Luxury", "Shopping", "Architecture", "Desert"],
    iataCode: "DXB",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    description: "Vibrant street life, ornate shrines, and a perfect blend of chaos and serenity.",
    imageUrl: "/placeholder.svg?key=7raak",
    bestTimeToVisit: "November to February",
    averagePrice: 70,
    flightTime: "18-20 hours from US",
    tags: ["Food", "Culture", "Shopping", "Temples"],
    iataCode: "BKK",
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    description: "Stunning white-washed buildings with blue domes overlooking the azure Aegean Sea.",
    imageUrl: "/placeholder.svg?height=400&width=600&query=Santorini white buildings blue domes",
    bestTimeToVisit: "April to October",
    averagePrice: 150,
    flightTime: "10-12 hours from US",
    tags: ["Romantic", "Beach", "Views", "Food"],
    iataCode: "JTR",
  },
]

// Generate realistic flight data for a destination
export function generateMockFlightData(destinationId: string): FlightData[] {
  const airlines = [
    "American Airlines",
    "Delta",
    "United",
    "British Airways",
    "Lufthansa",
    "Air France",
    "Emirates",
    "Qatar Airways",
    "Singapore Airlines",
    "Cathay Pacific",
    "JetBlue",
    "Southwest",
  ]

  const destination = destinations.find((d) => d.id === destinationId)

  // Base price varies by destination
  let basePrice = 500
  if (destination) {
    // Adjust base price based on destination's average price and distance
    if (destination.flightTime.includes("20+")) basePrice = 1200
    else if (destination.flightTime.includes("14-16")) basePrice = 1000
    else if (destination.flightTime.includes("10-12")) basePrice = 800
    else if (destination.flightTime.includes("8-10")) basePrice = 700
    else if (destination.flightTime.includes("7-8")) basePrice = 600
    else if (destination.flightTime.includes("3-5")) basePrice = 400
  }

  // Generate 3-5 flight options
  const numFlights = Math.floor(Math.random() * 3) + 3
  const results: FlightData[] = []

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000) + 100}`

    // Generate departure time between 6am and 10pm
    const departureHour = Math.floor(Math.random() * 16) + 6
    const departureMinute = Math.floor(Math.random() * 60)
    const departureTime = `${departureHour.toString().padStart(2, "0")}:${departureMinute.toString().padStart(2, "0")}`

    // Determine flight duration based on destination's flight time
    let durationHours = 3
    const durationMinutes = Math.floor(Math.random() * 60)

    if (destination) {
      if (destination.flightTime.includes("20+")) durationHours = 20 + Math.floor(Math.random() * 4)
      else if (destination.flightTime.includes("18-20")) durationHours = 18 + Math.floor(Math.random() * 3)
      else if (destination.flightTime.includes("14-16")) durationHours = 14 + Math.floor(Math.random() * 3)
      else if (destination.flightTime.includes("12-14")) durationHours = 12 + Math.floor(Math.random() * 3)
      else if (destination.flightTime.includes("10-12")) durationHours = 10 + Math.floor(Math.random() * 3)
      else if (destination.flightTime.includes("8-10")) durationHours = 8 + Math.floor(Math.random() * 3)
      else if (destination.flightTime.includes("7-8")) durationHours = 7 + Math.floor(Math.random() * 2)
      else if (destination.flightTime.includes("3-5")) durationHours = 3 + Math.floor(Math.random() * 3)
    }

    // Calculate arrival time
    const arrivalHour = (departureHour + durationHours + Math.floor(durationMinutes / 60)) % 24
    const arrivalMinute = (departureMinute + durationMinutes) % 60
    const arrivalTime = `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute.toString().padStart(2, "0")}`

    // Determine number of stops
    const stops = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2

    // Adjust price based on stops, airline, and random variation
    let price = basePrice
    if (stops === 0) price += 50 + Math.floor(Math.random() * 100)
    else if (stops === 1) price -= 20 + Math.floor(Math.random() * 50)
    else price -= 50 + Math.floor(Math.random() * 100)

    // Premium airlines cost more
    if (["Emirates", "Qatar Airways", "Singapore Airlines", "Cathay Pacific"].includes(airline)) {
      price += 100 + Math.floor(Math.random() * 150)
    }

    // Add some random variation
    price += Math.floor(Math.random() * 100) - 50

    results.push({
      airline,
      flightNumber,
      departureTime,
      arrivalTime,
      duration: `${durationHours}h ${durationMinutes}m`,
      stops,
      price,
    })
  }

  // Sort by price
  return results.sort((a, b) => a.price - b.price)
}

// Function to get random popular destinations
export function getRandomDestinations(count = 10): Destination[] {
  // Shuffle the destinations array
  const shuffled = [...destinations].sort(() => 0.5 - Math.random())
  // Return the first 'count' destinations
  return shuffled.slice(0, Math.min(count, destinations.length))
}

// Function to search for destinations by query
export function searchDestinations(query: string): Destination[] {
  if (!query) return destinations

  const lowerQuery = query.toLowerCase()
  return destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(lowerQuery) ||
      dest.country.toLowerCase().includes(lowerQuery) ||
      dest.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

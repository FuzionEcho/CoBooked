// Types for car hire results
export interface CarHireQuote {
  id: string
  vendor: string
  vendorLogo: string
  agent: string
  vehicleType: string
  vehicleName: string
  price: number
  currency: string
  features: string[]
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  deepLink: string
}

export interface CarHireSearchParams {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: Date
  dropoffDate: Date
  driverAge: number
}

// Mock data for car hire search
export async function searchCarHire(params: CarHireSearchParams): Promise<CarHireQuote[]> {
  try {
    // In a real implementation, this would call the Skyscanner Car Hire API
    // First create a session with the /create endpoint
    // Then poll for results with the /poll endpoint

    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return generateMockCarHireResults(params)
  } catch (error) {
    console.error("Error searching car hire:", error)
    return []
  }
}

// Helper function to generate mock car hire results
function generateMockCarHireResults(params: CarHireSearchParams): CarHireQuote[] {
  const vendors = [
    { name: "Hertz", logo: "/hertz-logo.png" },
    { name: "Avis", logo: "/placeholder.svg?key=jkehc" },
    { name: "Enterprise", logo: "/abstract-enterprise-logo.png" },
    { name: "Budget", logo: "/placeholder.svg?key=7njh8" },
    { name: "Sixt", logo: "/placeholder.svg?key=gndug" },
    { name: "Europcar", logo: "/placeholder.svg?key=4jexo" },
  ]

  const agents = ["Rentalcars.com", "Expedia", "Skyscanner", "Kayak", "Priceline"]

  const vehicleTypes = [
    { type: "Economy", names: ["Toyota Yaris", "Ford Fiesta", "Volkswagen Polo"], basePrice: 25 },
    { type: "Compact", names: ["Ford Focus", "Volkswagen Golf", "Toyota Corolla"], basePrice: 35 },
    { type: "Intermediate", names: ["Skoda Octavia", "Mazda 3", "Honda Civic"], basePrice: 45 },
    { type: "Standard", names: ["Toyota Camry", "Ford Mondeo", "Volkswagen Passat"], basePrice: 55 },
    { type: "Full-size", names: ["BMW 3 Series", "Audi A4", "Mercedes C-Class"], basePrice: 75 },
    { type: "Premium", names: ["BMW 5 Series", "Audi A6", "Mercedes E-Class"], basePrice: 95 },
    { type: "SUV", names: ["Toyota RAV4", "Honda CR-V", "Nissan Qashqai"], basePrice: 65 },
  ]

  const features = [
    "Air Conditioning",
    "Automatic Transmission",
    "Manual Transmission",
    "Bluetooth",
    "GPS Navigation",
    "Unlimited Mileage",
    "Free Cancellation",
    "Theft Protection",
    "Collision Damage Waiver",
  ]

  const results: CarHireQuote[] = []

  // Calculate rental duration in days
  const pickupTime = params.pickupDate.getTime()
  const dropoffTime = params.dropoffDate.getTime()
  const durationDays = Math.max(1, Math.ceil((dropoffTime - pickupTime) / (1000 * 60 * 60 * 24)))

  // Generate 15-20 random quotes
  const numQuotes = Math.floor(Math.random() * 6) + 15

  for (let i = 0; i < numQuotes; i++) {
    const vendorIndex = Math.floor(Math.random() * vendors.length)
    const vehicleTypeIndex = Math.floor(Math.random() * vehicleTypes.length)
    const vehicleNameIndex = Math.floor(Math.random() * vehicleTypes[vehicleTypeIndex].names.length)
    const agentIndex = Math.floor(Math.random() * agents.length)

    // Select 2-4 random features
    const carFeatures = []
    const numFeatures = Math.floor(Math.random() * 3) + 2
    for (let j = 0; j < numFeatures; j++) {
      const feature = features[Math.floor(Math.random() * features.length)]
      if (!carFeatures.includes(feature)) {
        carFeatures.push(feature)
      }
    }

    // Calculate price based on vehicle type, duration, and a random factor
    const basePrice = vehicleTypes[vehicleTypeIndex].basePrice
    const totalPrice = Math.round(basePrice * durationDays * (0.9 + Math.random() * 0.4))

    results.push({
      id: `car-${i}`,
      vendor: vendors[vendorIndex].name,
      vendorLogo: vendors[vendorIndex].logo,
      agent: agents[agentIndex],
      vehicleType: vehicleTypes[vehicleTypeIndex].type,
      vehicleName: vehicleTypes[vehicleTypeIndex].names[vehicleNameIndex],
      price: totalPrice,
      currency: "USD",
      features: carFeatures,
      pickupLocation: params.pickupLocation,
      dropoffLocation: params.dropoffLocation,
      pickupDate: params.pickupDate.toISOString(),
      dropoffDate: params.dropoffDate.toISOString(),
      deepLink: `https://example.com/book?car=${i}&pickup=${params.pickupLocation}&dropoff=${params.dropoffLocation}`,
    })
  }

  // Sort by price
  return results.sort((a, b) => a.price - b.price)
}

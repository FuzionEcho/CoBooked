export async function searchAirports(query: string) {
  try {
    const response = await fetch(`/api/flights/airports?query=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to search airports")
    }
    return await response.json()
  } catch (error) {
    console.error("Error searching airports:", error)
    return { places: [] }
  }
}

export async function searchFlights(params: {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string | null
  adults: number
}) {
  try {
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to search flights")
    }

    return await response.json()
  } catch (error) {
    console.error("Error searching flights:", error)
    return { error: "Failed to search flights" }
  }
}

// Format duration in minutes to a readable string (e.g. 125 -> "2h 5m")
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// Format price (e.g. 123.45 -> "$123")
export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

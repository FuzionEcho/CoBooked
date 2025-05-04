import { NextResponse } from "next/server"

// Mock data for fallback when API fails
const mockLocationsData = {
  places: [
    {
      entityId: "27544008",
      name: "London Heathrow Airport",
      type: "PLACE_TYPE_AIRPORT",
      highlight: "<b>Lon</b>don Heathrow Airport",
      hierarchy: ["United Kingdom", "England", "London"],
      location: {
        latitude: 51.4706,
        longitude: -0.461941,
      },
    },
    {
      entityId: "27538634",
      name: "London City",
      type: "PLACE_TYPE_CITY",
      highlight: "<b>Lon</b>don City",
      hierarchy: ["United Kingdom", "England"],
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
      },
    },
    {
      entityId: "27539733",
      name: "Paris Charles de Gaulle Airport",
      type: "PLACE_TYPE_AIRPORT",
      highlight: "Paris Charles de Gaulle Airport",
      hierarchy: ["France", "Île-de-France", "Paris"],
      location: {
        latitude: 49.00970078,
        longitude: 2.547850132,
      },
    },
    {
      entityId: "27539733",
      name: "Paris City",
      type: "PLACE_TYPE_CITY",
      highlight: "Paris City",
      hierarchy: ["France", "Île-de-France"],
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    },
    {
      entityId: "27542544",
      name: "Tokyo Narita International Airport",
      type: "PLACE_TYPE_AIRPORT",
      highlight: "Tokyo Narita International Airport",
      hierarchy: ["Japan", "Kanto", "Tokyo"],
      location: {
        latitude: 35.76470184,
        longitude: 140.3860016,
      },
    },
  ],
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const searchTerm = body.query

    if (!searchTerm && searchTerm !== "") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    console.log("Searching for car hire locations with query:", searchTerm)

    try {
      // Format the request according to the Skyscanner API documentation
      const requestBody = {
        query: {
          market: "UK",
          locale: "en-GB",
          searchTerm: searchTerm,
        },
      }

      const response = await fetch("https://partners.api.skyscanner.net/apiservices/v3/autosuggest/carhire", {
        method: "POST",
        headers: {
          "x-api-key": process.env.SKYSCANNER_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Skyscanner API error:", errorText)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (apiError) {
      console.error("API request error:", apiError)

      // Filter mock data based on the query
      const filteredMockData = {
        places: mockLocationsData.places.filter(
          (place) =>
            place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (place.hierarchy && place.hierarchy.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()))),
        ),
      }

      return NextResponse.json(filteredMockData)
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

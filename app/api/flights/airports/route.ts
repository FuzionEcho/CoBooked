import { NextResponse } from "next/server"

// Mock data for fallback when API fails
const mockAirportsData = {
  places: [
    {
      entityId: "27544008",
      parentId: "27544008",
      name: "New York John F. Kennedy International",
      type: "PLACE_TYPE_AIRPORT",
      iataCode: "JFK",
      coordinates: {
        latitude: 40.63980103,
        longitude: -73.77890015,
      },
      cityName: "New York",
      cityId: "27537542",
      countryName: "United States",
      countryId: "US",
    },
    {
      entityId: "27545430",
      parentId: "27545430",
      name: "Los Angeles International",
      type: "PLACE_TYPE_AIRPORT",
      iataCode: "LAX",
      coordinates: {
        latitude: 33.94250107,
        longitude: -118.4079971,
      },
      cityName: "Los Angeles",
      cityId: "27538634",
      countryName: "United States",
      countryId: "US",
    },
    {
      entityId: "27541927",
      parentId: "27541927",
      name: "London Heathrow",
      type: "PLACE_TYPE_AIRPORT",
      iataCode: "LHR",
      coordinates: {
        latitude: 51.4706,
        longitude: -0.461941,
      },
      cityName: "London",
      cityId: "27544008",
      countryName: "United Kingdom",
      countryId: "GB",
    },
    {
      entityId: "27539733",
      parentId: "27539733",
      name: "Paris Charles de Gaulle",
      type: "PLACE_TYPE_AIRPORT",
      iataCode: "CDG",
      coordinates: {
        latitude: 49.00970078,
        longitude: 2.547850132,
      },
      cityName: "Paris",
      cityId: "27539733",
      countryName: "France",
      countryId: "FR",
    },
    {
      entityId: "27542544",
      parentId: "27542544",
      name: "Tokyo Narita International",
      type: "PLACE_TYPE_AIRPORT",
      iataCode: "NRT",
      coordinates: {
        latitude: 35.76470184,
        longitude: 140.3860016,
      },
      cityName: "Tokyo",
      cityId: "27542544",
      countryName: "Japan",
      countryId: "JP",
    },
  ],
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const searchTerm = body.query

    if (!searchTerm) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    console.log("Searching for airports with query:", searchTerm)

    try {
      // Format the request according to the Skyscanner API documentation
      const requestBody = {
        query: {
          market: "US",
          locale: "en-US",
          searchTerm: searchTerm,
          includedEntityTypes: ["PLACE_TYPE_AIRPORT", "PLACE_TYPE_CITY"],
        },
        limit: 10,
        isDestination: false,
      }

      const response = await fetch("https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights", {
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

      // Transform the response to match what our frontend expects
      const transformedData = {
        places: data.places.map((place: any) => ({
          entityId: place.entityId,
          parentId: place.parentId || place.entityId,
          name: place.name,
          type: place.type,
          iata: place.iataCode,
          cityName: place.cityName,
          countryName: place.countryName,
          coordinates: place.location
            ? {
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }
            : undefined,
        })),
      }

      return NextResponse.json(transformedData)
    } catch (apiError) {
      console.error("API request error:", apiError)

      // Filter mock data based on the query
      const filteredMockData = {
        places: mockAirportsData.places.filter(
          (place) =>
            place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            place.iataCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (place.cityName && place.cityName.toLowerCase().includes(searchTerm.toLowerCase())),
        ),
      }

      // Transform mock data to match frontend expectations
      const transformedMockData = {
        places: filteredMockData.places.map((place) => ({
          ...place,
          iata: place.iataCode,
        })),
      }

      return NextResponse.json(transformedMockData)
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

// Store for search sessions (in a real app, this would be in a database or Redis)
const searchSessions: Record<
  string,
  {
    sessionToken: string
    status: "pending" | "complete"
    created: number
    lastPolled: number
    results: any
    origin: string
    destination: string
  }
> = {}

// Clean up old sessions periodically (every 5 minutes)
setInterval(
  () => {
    const now = Date.now()
    const expiryTime = 30 * 60 * 1000 // 30 minutes

    Object.keys(searchSessions).forEach((key) => {
      if (now - searchSessions[key].created > expiryTime) {
        delete searchSessions[key]
      }
    })
  },
  5 * 60 * 1000,
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionToken, query } = body

    // If sessionToken is provided, this is a poll request
    if (sessionToken && searchSessions[sessionToken]) {
      return handlePollRequest(sessionToken)
    }

    // Otherwise, this is a create request
    return handleCreateRequest(query)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleCreateRequest(query: any) {
  if (!query) {
    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 })
  }

  // Generate a unique session token
  const sessionToken = `search-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

  // Create a new search session
  searchSessions[sessionToken] = {
    sessionToken,
    status: "pending",
    created: Date.now(),
    lastPolled: Date.now(),
    results: null,
    origin: query.queryLegs?.[0]?.originPlaceId?.iata || "",
    destination: query.queryLegs?.[0]?.destinationPlaceId?.iata || "",
  }

  // Make the initial request to Skyscanner
  const url = `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.SKYSCANNER_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Skyscanner API error:", errorText)

      // Update session with error
      searchSessions[sessionToken].status = "complete"
      searchSessions[sessionToken].results = { error: "Error fetching flight data" }

      return NextResponse.json(
        {
          sessionToken,
          status: "error",
          error: "Error fetching flight data",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Check if search is complete
    const isComplete =
      data.status === "COMPLETED" ||
      (data.content?.results?.itineraries &&
        Object.keys(data.content.results.itineraries).length > 0 &&
        !data.content.status?.includes("INCOMPLETE"))

    // Update session with results
    searchSessions[sessionToken].results = data
    if (isComplete) {
      searchSessions[sessionToken].status = "complete"
    }

    // Return the initial results along with the session token and status
    return NextResponse.json({
      sessionToken,
      status: isComplete ? "complete" : "pending",
      action: "replace", // Initial data should replace any existing data
      progress: data.content?.status?.searchProgress || 0,
      content: data.content,
      origin: query.queryLegs?.[0]?.originPlaceId?.iata || "",
      destination: query.queryLegs?.[0]?.destinationPlaceId?.iata || "",
    })
  } catch (error) {
    console.error("Error in create request:", error)

    // Update session with error
    searchSessions[sessionToken].status = "complete"
    searchSessions[sessionToken].results = { error: "Error fetching flight data" }

    return NextResponse.json(
      {
        sessionToken,
        status: "error",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function handlePollRequest(sessionToken: string) {
  const session = searchSessions[sessionToken]

  // Update last polled time
  session.lastPolled = Date.now()

  // If the session is already complete, return the final results
  if (session.status === "complete") {
    return NextResponse.json({
      sessionToken,
      status: "complete",
      action: "replace", // Final data should replace any existing data
      progress: 100,
      content: session.results.content,
      origin: session.origin,
      destination: session.destination,
    })
  }

  // Otherwise, poll the Skyscanner API for updates
  const url = `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/${sessionToken}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.SKYSCANNER_API_KEY!,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Skyscanner API poll error:", errorText)

      // If polling fails but we have previous results, return those
      if (session.results) {
        return NextResponse.json({
          sessionToken,
          status: "error",
          action: "keep", // Keep existing data on error
          error: "Error polling for updates",
          content: session.results.content,
          origin: session.origin,
          destination: session.destination,
        })
      }

      return NextResponse.json(
        {
          sessionToken,
          status: "error",
          error: "Error polling for updates",
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Check if search is now complete
    const isComplete =
      data.status === "COMPLETED" ||
      (data.content?.results?.itineraries &&
        Object.keys(data.content.results.itineraries).length > 0 &&
        !data.content.status?.includes("INCOMPLETE"))

    // Determine if the data has changed
    const hasChanged = JSON.stringify(data.content) !== JSON.stringify(session.results.content)

    // Update session with new results
    session.results = data
    if (isComplete) {
      session.status = "complete"
    }

    // Return the updated results
    return NextResponse.json({
      sessionToken,
      status: isComplete ? "complete" : "pending",
      action: hasChanged ? "replace" : "keep", // Replace only if data changed
      progress: data.content?.status?.searchProgress || 0,
      content: data.content,
      origin: session.origin,
      destination: session.destination,
    })
  } catch (error) {
    console.error("Error in poll request:", error)

    // If polling fails but we have previous results, return those
    if (session.results) {
      return NextResponse.json({
        sessionToken,
        status: "error",
        action: "keep", // Keep existing data on error
        error: "Error polling for updates",
        content: session.results.content,
        origin: session.origin,
        destination: session.destination,
      })
    }

    return NextResponse.json(
      {
        sessionToken,
        status: "error",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

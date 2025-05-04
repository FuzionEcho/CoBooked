"use client"

import { useState } from "react"
import { CarHireSearch, type CarHireSearchParams } from "@/components/car-hire-search"
import { CarHireResults } from "@/components/car-hire-results"
import { searchCarHire, type CarHireQuote } from "@/lib/car-hire-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function CarHirePage() {
  const [searchResults, setSearchResults] = useState<CarHireQuote[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<CarHireSearchParams | null>(null)

  const handleSearch = async (params: CarHireSearchParams) => {
    setLoading(true)
    setSearchParams(params)

    try {
      const results = await searchCarHire(params)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching for car hire:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Car Hire Search</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About Car Hire</AlertTitle>
        <AlertDescription>
          Find the best car rental deals from top providers. Enter your pickup and drop-off locations, select your
          dates, and we'll show you the best available options.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <CarHireSearch onSearch={handleSearch} />
        </div>

        <div className="lg:col-span-2">
          {searchResults ? (
            <CarHireResults results={searchResults} loading={loading} />
          ) : (
            <div className="h-full flex items-center justify-center p-8 border rounded-lg bg-muted/50">
              <p className="text-center text-muted-foreground">Search for car hire options to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

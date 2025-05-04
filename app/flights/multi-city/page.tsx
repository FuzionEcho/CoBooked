"use client"

import { useState } from "react"
import { MultiCityFlightSearch } from "@/components/multi-city-flight-search"
import { MultiCityFlightResults } from "@/components/multi-city-flight-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function MultiCityFlightPage() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = (results: any) => {
    setSearchResults(results)
    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Multi-City Flight Search</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About Multi-City Flights</AlertTitle>
        <AlertDescription>
          Multi-city flights allow you to create complex itineraries with multiple stops in different cities. This is
          perfect for travelers who want to visit multiple destinations in a single trip.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Your Multi-City Journey</CardTitle>
            <CardDescription>Search for flights with multiple stops in different cities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="results" disabled={!searchResults}>
                  Results
                </TabsTrigger>
              </TabsList>
              <TabsContent value="search">
                <MultiCityFlightSearch
                  onSearch={(results) => {
                    setLoading(true)
                    handleSearch(results)
                  }}
                />
              </TabsContent>
              <TabsContent value="results">
                {searchResults && <MultiCityFlightResults results={searchResults} loading={loading} />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

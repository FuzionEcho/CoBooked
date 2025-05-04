"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CarHireQuote } from "@/lib/car-hire-service"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import { Car, Check, ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface CarHireResultsProps {
  results: CarHireQuote[]
  loading?: boolean
}

export function CarHireResults({ results, loading = false }: CarHireResultsProps) {
  const [sortBy, setSortBy] = useState<"price" | "vendor">("price")
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null)

  // Get unique vehicle types for filtering
  const vehicleTypes = Array.from(new Set(results.map((result) => result.vehicleType)))

  // Filter results by selected vehicle type
  const filteredResults = selectedVehicleType
    ? results.filter((result) => result.vehicleType === selectedVehicleType)
    : results

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "price") {
      return a.price - b.price
    } else {
      return a.vendor.localeCompare(b.vendor)
    }
  })

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Car Hire Options...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Car Hire Options Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Try adjusting your search criteria to find available car hire options.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            <span>Car Hire Options ({results.length})</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span>Sort by:</span>
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as "price" | "vendor")}>
              <TabsList>
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={selectedVehicleType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedVehicleType(null)}
          >
            All Types
          </Button>
          {vehicleTypes.map((type) => (
            <Button
              key={type}
              variant={selectedVehicleType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedVehicleType(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        <div className="grid gap-4">
          {sortedResults.map((car) => (
            <Card key={car.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    {car.vendorLogo && (
                      <div className="h-8 w-16 relative">
                        <Image
                          src={car.vendorLogo || "/placeholder.svg"}
                          alt={car.vendor}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{car.vendor}</div>
                      <div className="text-sm text-muted-foreground">via {car.agent}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-bold">{car.vehicleName}</div>
                    <Badge variant="outline" className="mt-1">
                      {car.vehicleType}
                    </Badge>
                  </div>
                </div>

                <div className="border-t md:border-l md:border-t-0 p-4">
                  <div className="text-sm font-medium">Features</div>
                  <ul className="mt-2 grid grid-cols-1 gap-1">
                    {car.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 text-sm">
                    <div>
                      <span className="font-medium">Pickup:</span> {format(new Date(car.pickupDate), "PPP")}
                    </div>
                    <div>
                      <span className="font-medium">Return:</span> {format(new Date(car.dropoffDate), "PPP")}
                    </div>
                  </div>
                </div>

                <div className="border-t md:border-l md:border-t-0 p-4 flex flex-col justify-between">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatPrice(car.price, car.currency)}</div>
                    <div className="text-sm text-muted-foreground">Total price</div>
                  </div>
                  <Button className="mt-4 w-full" asChild>
                    <a
                      href={car.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Book Now
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

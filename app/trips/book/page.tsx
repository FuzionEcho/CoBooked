"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchTabs } from "@/components/search/search-tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Lightbulb, PlayCircle } from "lucide-react"
import Link from "next/link"

// Define destination options with non-empty string IDs
const DESTINATIONS = [
  { id: "paris", name: "Paris, France" },
  { id: "tokyo", name: "Tokyo, Japan" },
  { id: "newyork", name: "New York, USA" },
  { id: "barcelona", name: "Barcelona, Spain" },
  { id: "bali", name: "Bali, Indonesia" },
  { id: "london", name: "London, UK" },
  { id: "rome", name: "Rome, Italy" },
  { id: "sydney", name: "Sydney, Australia" },
]

// Define traveler options
const TRAVELER_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"]

export default function BookTripPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Form state
  const [formState, setFormState] = useState({
    destinationId: DESTINATIONS[0].id, // Default to first destination
    departureLocation: "",
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    travelers: TRAVELER_OPTIONS[0], // Default to first option
  })

  // Update form state helper
  const updateForm = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateTrip = async () => {
    if (!formState.destinationId || !formState.departureDate) {
      toast({
        title: "Missing information",
        description: "Please select a destination and departure date",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would create the trip in the database here
      // For now, we'll just switch to the search tab
      setActiveTab("search")
      toast({
        title: "Trip created!",
        description: "Now you can search for flights, hotels, and activities",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get the selected destination name
  const selectedDestination = DESTINATIONS.find((d) => d.id === formState.destinationId)
  const destinationName = selectedDestination ? selectedDestination.name.split(",")[0] : "Unknown"

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Book Your Trip</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Trip Details</TabsTrigger>
          <TabsTrigger value="search">Search & Book</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Enter the details for your trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <Collapsible className="w-full">
                    <div className="p-4">
                      <CollapsibleTrigger className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Lightbulb className="h-4 w-4" />
                          <span className="font-medium">
                            Don&apos;t know where to start? Play this match-making game to get destination
                            recommendations
                          </span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform duration-200 ui-open:rotate-180" />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t border-blue-200 dark:border-blue-900 p-4">
                        <p className="mb-4 text-sm text-muted-foreground">
                          Our destination match game helps you discover places you&apos;ll love. Swipe through beautiful
                          destinations and get personalized recommendations based on your preferences.
                        </p>
                        <Button asChild variant="outline" className="gap-2">
                          <Link href="/match-game">
                            <PlayCircle className="h-4 w-4" />
                            Play Match Game
                          </Link>
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select value={formState.destinationId} onValueChange={(value) => updateForm("destinationId", value)}>
                    <SelectTrigger id="destination">
                      <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure">Departure Location</Label>
                <Input
                  id="departure"
                  placeholder="City or Airport"
                  value={formState.departureLocation}
                  onChange={(e) => updateForm("departureLocation", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formState.departureDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formState.departureDate ? format(formState.departureDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formState.departureDate}
                        onSelect={(date) => updateForm("departureDate", date)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formState.returnDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formState.returnDate ? format(formState.returnDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formState.returnDate}
                        onSelect={(date) => updateForm("returnDate", date)}
                        initialFocus
                        disabled={(date) =>
                          date < new Date() || (formState.departureDate && date < formState.departureDate)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers">Number of Travelers</Label>
                <Select value={formState.travelers} onValueChange={(value) => updateForm("travelers", value)}>
                  <SelectTrigger id="travelers">
                    <SelectValue placeholder="Select number of travelers" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVELER_OPTIONS.map((num) => (
                      <SelectItem key={num} value={num}>
                        {num} {num === "1" ? "traveler" : "travelers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateTrip} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Continue to Search"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          {activeTab === "search" ? (
            <SearchTabs
              tripId="new-trip"
              destination={destinationName}
              departureLocation={formState.departureLocation}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">Please enter your trip details first</p>
                <Button onClick={() => setActiveTab("details")}>Enter Trip Details</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

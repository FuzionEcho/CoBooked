"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn, formatPrice, calculateNights } from "@/lib/utils"
import { CalendarIcon, Loader2, Star, Check, MapPin, Wifi, PocketIcon as Pool, Utensils } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { searchHotels, type HotelSearchResult } from "@/lib/search-service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"

interface HotelSearchProps {
  tripId: string
  destination: string
}

export function HotelSearch({ tripId, destination }: HotelSearchProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [minStars, setMinStars] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [hotelResults, setHotelResults] = useState<HotelSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [savedHotels, setSavedHotels] = useState<string[]>([])

  const handleSearch = async () => {
    if (!destination || !checkInDate || !checkOutDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const results = await searchHotels({
        destination,
        checkIn: format(checkInDate, "yyyy-MM-dd"),
        checkOut: format(checkOutDate, "yyyy-MM-dd"),
        guests,
        rooms,
        minStars,
        maxPrice,
      })

      setHotelResults(results)
    } catch (error) {
      console.error("Error searching hotels:", error)
      toast({
        title: "Error",
        description: "Failed to search for hotels. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveHotel = async (hotelId: string) => {
    try {
      if (savedHotels.includes(hotelId)) {
        setSavedHotels(savedHotels.filter((id) => id !== hotelId))
      } else {
        setSavedHotels([...savedHotels, hotelId])

        // In a real app, you would save this to the database
        toast({
          title: "Hotel saved",
          description: "This hotel has been saved to your trip",
        })
      }
    } catch (error) {
      console.error("Error saving hotel:", error)
      toast({
        title: "Error",
        description: "Failed to save hotel. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to render amenity icons
  const renderAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "free wifi":
        return <Wifi className="h-4 w-4" />
      case "swimming pool":
        return <Pool className="h-4 w-4" />
      case "restaurant":
        return <Utensils className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    initialFocus
                    disabled={(date) => date < new Date() || (checkInDate ? date <= checkInDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Guests</Label>
              <Select value={guests.toString()} onValueChange={(value) => setGuests(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rooms</Label>
              <Select value={rooms.toString()} onValueChange={(value) => setRooms(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of rooms" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "room" : "rooms"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Minimum Star Rating: {minStars > 0 ? minStars : "Any"}</Label>
            <Slider value={[minStars]} min={0} max={5} step={1} onValueChange={(value) => setMinStars(value[0])} />
          </div>

          <div className="space-y-2">
            <Label>Maximum Price per Night: {formatPrice(maxPrice)}</Label>
            <Slider value={[maxPrice]} min={50} max={2000} step={50} onValueChange={(value) => setMaxPrice(value[0])} />
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>Search Hotels</>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hotel Results</h3>
          {hotelResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No hotels found. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              {hotelResults.map((hotel) => (
                <Card key={hotel.id} className="mb-4 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-48 md:h-full">
                      <img
                        src={hotel.imageUrl || "/placeholder.svg"}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="col-span-2 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{hotel.name}</h3>
                          <div className="flex items-center mt-1">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {hotel.address}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{formatPrice(hotel.price, hotel.currency)}</div>
                          <div className="text-sm text-muted-foreground">per night</div>
                          {checkInDate && checkOutDate && (
                            <div className="text-sm mt-1">
                              {calculateNights(format(checkInDate, "yyyy-MM-dd"), format(checkOutDate, "yyyy-MM-dd"))}{" "}
                              nights:{" "}
                              {formatPrice(
                                hotel.price *
                                  calculateNights(
                                    format(checkInDate, "yyyy-MM-dd"),
                                    format(checkOutDate, "yyyy-MM-dd"),
                                  ),
                                hotel.currency,
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm mt-3">{hotel.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {hotel.amenities.slice(0, 5).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {renderAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                        {hotel.amenities.length > 5 && (
                          <Badge variant="outline">+{hotel.amenities.length - 5} more</Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                          <span className="font-medium">{hotel.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">({hotel.reviewCount} reviews)</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSaveHotel(hotel.id)}
                          className={savedHotels.includes(hotel.id) ? "bg-primary text-primary-foreground" : ""}
                        >
                          {savedHotels.includes(hotel.id) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Saved
                            </>
                          ) : (
                            "Save to Trip"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

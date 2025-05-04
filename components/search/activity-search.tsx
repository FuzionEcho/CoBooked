"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn, formatPrice } from "@/lib/utils"
import { CalendarIcon, Loader2, Star, Check, Clock, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { searchActivities, type ActivitySearchResult } from "@/lib/search-service"
import { Slider } from "@/components/ui/slider"

interface ActivitySearchProps {
  tripId: string
  destination: string
}

const activityCategories = [
  "All Categories",
  "Sightseeing Tour",
  "Museum Visit",
  "Adventure Activity",
  "Food Tour",
  "Cultural Experience",
  "Nature Excursion",
  "Historical Tour",
  "Water Activity",
  "Workshop",
  "Entertainment",
]

export function ActivitySearch({ tripId, destination }: ActivitySearchProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activityDate, setActivityDate] = useState<Date | undefined>()
  const [category, setCategory] = useState("All Categories")
  const [maxPrice, setMaxPrice] = useState(500)
  const [activityResults, setActivityResults] = useState<ActivitySearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [savedActivities, setSavedActivities] = useState<string[]>([])

  const handleSearch = async () => {
    if (!destination) {
      toast({
        title: "Missing information",
        description: "Please specify a destination",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const results = await searchActivities({
        destination,
        date: activityDate ? format(activityDate, "yyyy-MM-dd") : undefined,
        category: category !== "All Categories" ? category : undefined,
        maxPrice,
      })

      setActivityResults(results)
    } catch (error) {
      console.error("Error searching activities:", error)
      toast({
        title: "Error",
        description: "Failed to search for activities. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSaveActivity = async (activityId: string) => {
    try {
      if (savedActivities.includes(activityId)) {
        setSavedActivities(savedActivities.filter((id) => id !== activityId))
      } else {
        setSavedActivities([...savedActivities, activityId])

        // In a real app, you would save this to the database
        toast({
          title: "Activity saved",
          description: "This activity has been saved to your trip",
        })
      }
    } catch (error) {
      console.error("Error saving activity:", error)
      toast({
        title: "Error",
        description: "Failed to save activity. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activity Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !activityDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activityDate ? format(activityDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={activityDate}
                    onSelect={setActivityDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {activityCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Price: {formatPrice(maxPrice)}</Label>
            <Slider value={[maxPrice]} min={10} max={1000} step={10} onValueChange={(value) => setMaxPrice(value[0])} />
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>Search Activities</>
            )}
          </Button>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Activity Results</h3>
          {activityResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No activities found. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activityResults.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  <div className="h-48">
                    <img
                      src={activity.imageUrl || "/placeholder.svg"}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{activity.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {activity.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(activity.price, activity.currency)}</div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.duration}
                    </div>

                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {activity.location}
                    </div>

                    <p className="text-sm mt-2 line-clamp-2">{activity.description}</p>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                        <span className="font-medium">{activity.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({activity.reviewCount} reviews)</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveActivity(activity.id)}
                        className={savedActivities.includes(activity.id) ? "bg-primary text-primary-foreground" : ""}
                      >
                        {savedActivities.includes(activity.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Saved
                          </>
                        ) : (
                          "Save to Trip"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

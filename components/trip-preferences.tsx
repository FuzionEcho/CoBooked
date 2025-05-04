"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface TripPreferencesProps {
  tripId: string
  userId: string
}

const interestOptions = [
  "Beach",
  "Mountains",
  "City",
  "Culture",
  "Food",
  "Nightlife",
  "Adventure",
  "Relaxation",
  "Shopping",
  "History",
  "Nature",
  "Art",
]

export function TripPreferences({ tripId, userId }: TripPreferencesProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    budget: 1000,
    interests: [] as string[],
    departure_location: "",
    travel_dates: [] as string[],
  })
  const [date, setDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const { data, error } = await supabase
          .from("trip_preferences")
          .select("*")
          .eq("trip_id", tripId)
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setPreferences({
            budget: data.budget || 1000,
            interests: data.interests || [],
            departure_location: data.departure_location || "",
            travel_dates: data.travel_dates || [],
          })
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [supabase, tripId, userId])

  const handleInterestToggle = (interest: string) => {
    setPreferences((prev) => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        }
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        }
      }
    })
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      if (!preferences.travel_dates.includes(dateStr)) {
        setPreferences((prev) => ({
          ...prev,
          travel_dates: [...prev.travel_dates, dateStr].sort(),
        }))
      }
    }
  }

  const removeDate = (dateStr: string) => {
    setPreferences((prev) => ({
      ...prev,
      travel_dates: prev.travel_dates.filter((d) => d !== dateStr),
    }))
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("trip_preferences")
        .select("*")
        .eq("trip_id", tripId)
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from("trip_preferences")
          .update({
            budget: preferences.budget,
            interests: preferences.interests,
            departure_location: preferences.departure_location,
            travel_dates: preferences.travel_dates,
          })
          .eq("id", data.id)

        if (updateError) throw updateError
      } else {
        // Insert new preferences
        const { error: insertError } = await supabase.from("trip_preferences").insert({
          trip_id: tripId,
          user_id: userId,
          budget: preferences.budget,
          interests: preferences.interests,
          departure_location: preferences.departure_location,
          travel_dates: preferences.travel_dates,
        })

        if (insertError) throw insertError
      }

      toast({
        title: "Success",
        description: "Your preferences have been saved.",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Trip Preferences</CardTitle>
        <CardDescription>Help us find the perfect destination by sharing your preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="departure">Departure Location (City/Airport)</Label>
          <Input
            id="departure"
            placeholder="e.g. New York, London, LAX"
            value={preferences.departure_location}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                departure_location: e.target.value,
              }))
            }
          />
          <p className="text-sm text-muted-foreground">
            Specify your city or airport code for more accurate flight searches
          </p>
        </div>

        <div className="space-y-2">
          <Label>Budget (per person)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[preferences.budget]}
              min={100}
              max={5000}
              step={100}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, budget: value[0] }))}
              className="flex-1"
            />
            <span className="w-20 text-right font-medium">${preferences.budget}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Travel Dates</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {preferences.travel_dates.map((dateStr) => (
              <Badge key={dateStr} variant="secondary" className="cursor-pointer" onClick={() => removeDate(dateStr)}>
                {format(new Date(dateStr), "MMM d, yyyy")} ✕
              </Badge>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select dates"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest}
                variant={preferences.interests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} disabled={saving} className="ml-auto">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, MapPin, Plus, Trash2, Save, Edit, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generateId } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ItineraryBuilderProps {
  tripId: string
  destination: string
}

interface ItineraryDay {
  id: string
  day: number
  date: string
  activities: ItineraryActivity[]
}

interface ItineraryActivity {
  id: string
  time: string
  title: string
  description: string
  location: string
  category: string
}

const activityCategories = [
  "Sightseeing",
  "Food",
  "Transportation",
  "Accommodation",
  "Activity",
  "Meeting",
  "Free Time",
  "Other",
]

export function ItineraryBuilder({ tripId, destination }: ItineraryBuilderProps) {
  const { toast } = useToast()
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      id: "day-1",
      day: 1,
      date: new Date().toISOString().split("T")[0],
      activities: [],
    },
  ])
  const [editingActivity, setEditingActivity] = useState<string | null>(null)
  const [newActivity, setNewActivity] = useState<Partial<ItineraryActivity>>({
    time: "09:00",
    title: "",
    description: "",
    location: "",
    category: "Sightseeing",
  })

  const addDay = () => {
    const lastDay = itinerary[itinerary.length - 1]
    const newDate = new Date(lastDay.date)
    newDate.setDate(newDate.getDate() + 1)

    setItinerary([
      ...itinerary,
      {
        id: `day-${lastDay.day + 1}`,
        day: lastDay.day + 1,
        date: newDate.toISOString().split("T")[0],
        activities: [],
      },
    ])
  }

  const removeDay = (dayId: string) => {
    if (itinerary.length <= 1) {
      toast({
        title: "Cannot remove day",
        description: "Your itinerary must have at least one day.",
        variant: "destructive",
      })
      return
    }

    setItinerary(itinerary.filter((day) => day.id !== dayId))
  }

  const addActivity = (dayId: string) => {
    if (!newActivity.title) {
      toast({
        title: "Missing information",
        description: "Please provide an activity title.",
        variant: "destructive",
      })
      return
    }

    const updatedItinerary = itinerary.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              id: generateId(),
              time: newActivity.time || "09:00",
              title: newActivity.title || "",
              description: newActivity.description || "",
              location: newActivity.location || "",
              category: newActivity.category || "Sightseeing",
            },
          ].sort((a, b) => a.time.localeCompare(b.time)),
        }
      }
      return day
    })

    setItinerary(updatedItinerary)
    setNewActivity({
      time: "09:00",
      title: "",
      description: "",
      location: "",
      category: "Sightseeing",
    })

    toast({
      title: "Activity added",
      description: "The activity has been added to your itinerary.",
    })
  }

  const removeActivity = (dayId: string, activityId: string) => {
    const updatedItinerary = itinerary.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.filter((activity) => activity.id !== activityId),
        }
      }
      return day
    })

    setItinerary(updatedItinerary)
  }

  const startEditActivity = (dayId: string, activity: ItineraryActivity) => {
    setEditingActivity(activity.id)
    setNewActivity({
      time: activity.time,
      title: activity.title,
      description: activity.description,
      location: activity.location,
      category: activity.category,
    })
  }

  const saveEditActivity = (dayId: string, activityId: string) => {
    if (!newActivity.title) {
      toast({
        title: "Missing information",
        description: "Please provide an activity title.",
        variant: "destructive",
      })
      return
    }

    const updatedItinerary = itinerary.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities
            .map((activity) => {
              if (activity.id === activityId) {
                return {
                  ...activity,
                  time: newActivity.time || activity.time,
                  title: newActivity.title || activity.title,
                  description: newActivity.description || "",
                  location: newActivity.location || "",
                  category: newActivity.category || activity.category,
                }
              }
              return activity
            })
            .sort((a, b) => a.time.localeCompare(b.time)),
        }
      }
      return day
    })

    setItinerary(updatedItinerary)
    setEditingActivity(null)
    setNewActivity({
      time: "09:00",
      title: "",
      description: "",
      location: "",
      category: "Sightseeing",
    })
  }

  const saveItinerary = () => {
    // In a real app, this would save to the database
    toast({
      title: "Itinerary saved",
      description: "Your itinerary has been saved successfully.",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Trip Itinerary
        </CardTitle>
        <Button variant="outline" size="sm" onClick={saveItinerary}>
          <Save className="h-4 w-4 mr-2" />
          Save Itinerary
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[600px] pr-4">
          {itinerary.map((day) => (
            <div key={day.id} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Day {day.day}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeDay(day.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {day.activities.map((activity) => (
                  <Card key={activity.id} className="relative">
                    <CardContent className="p-4">
                      {editingActivity === activity.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`time-${activity.id}`}>Time</Label>
                              <Input
                                id={`time-${activity.id}`}
                                type="time"
                                value={newActivity.time}
                                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`category-${activity.id}`}>Category</Label>
                              <Select
                                value={newActivity.category}
                                onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                              >
                                <SelectTrigger id={`category-${activity.id}`}>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {activityCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`title-${activity.id}`}>Title</Label>
                            <Input
                              id={`title-${activity.id}`}
                              value={newActivity.title}
                              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`location-${activity.id}`}>Location</Label>
                            <Input
                              id={`location-${activity.id}`}
                              value={newActivity.location}
                              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`description-${activity.id}`}>Description (Optional)</Label>
                            <Textarea
                              id={`description-${activity.id}`}
                              value={newActivity.description}
                              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingActivity(null)
                                setNewActivity({
                                  time: "09:00",
                                  title: "",
                                  description: "",
                                  location: "",
                                  category: "Sightseeing",
                                })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveEditActivity(day.id, activity.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="text-center">
                                <div className="text-sm font-medium">{activity.time}</div>
                                <Clock className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                {activity.description && <p className="text-sm mt-1">{activity.description}</p>}
                                {activity.location && (
                                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {activity.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{activity.category}</Badge>
                              <Button variant="ghost" size="icon" onClick={() => startEditActivity(day.id, activity)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => removeActivity(day.id, activity.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`new-time-${day.id}`}>Time</Label>
                          <Input
                            id={`new-time-${day.id}`}
                            type="time"
                            value={newActivity.time}
                            onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`new-category-${day.id}`}>Category</Label>
                          <Select
                            value={newActivity.category}
                            onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                          >
                            <SelectTrigger id={`new-category-${day.id}`}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {activityCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`new-title-${day.id}`}>Title</Label>
                        <Input
                          id={`new-title-${day.id}`}
                          placeholder="Activity title"
                          value={newActivity.title}
                          onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`new-location-${day.id}`}>Location</Label>
                        <Input
                          id={`new-location-${day.id}`}
                          placeholder="Activity location"
                          value={newActivity.location}
                          onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`new-description-${day.id}`}>Description (Optional)</Label>
                        <Textarea
                          id={`new-description-${day.id}`}
                          placeholder="Activity description"
                          value={newActivity.description}
                          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <Button onClick={() => addActivity(day.id)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </ScrollArea>

        <Button variant="outline" onClick={addDay} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </CardContent>
    </Card>
  )
}

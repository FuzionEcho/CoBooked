"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Clock, Plus, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Client component for the activity suggestion dialog
function SuggestActivityDialog({ onAddSuggestion }) {
  const [showEnhanced, setShowEnhanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  })
  const [enhancedSuggestions, setEnhancedSuggestions] = useState([
    {
      id: "ai-1",
      name: "Gothic Quarter Walking Tour",
      description: "Explore the medieval streets and hidden squares of Barcelona's historic Gothic Quarter.",
      location: "Gothic Quarter, Barcelona",
      match: "Based on your interest in history and architecture",
    },
    {
      id: "ai-2",
      name: "Cooking Workshop at La Boqueria Market",
      description: "Shop for fresh ingredients at the famous market and learn to cook traditional Catalan dishes.",
      location: "La Boqueria Market, La Rambla",
      match: "Based on your interest in culinary experiences",
    },
    {
      id: "ai-3",
      name: "Sunset Sailing Trip",
      description: "Enjoy the Mediterranean Sea with a relaxing sunset sailing trip along Barcelona's coast.",
      location: "Port Olímpic, Barcelona",
      match: "Based on your preference for outdoor activities",
    },
  ])
  const [open, setOpen] = useState(false)

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id.replace("activity-", "")]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create new suggestion object
      const newSuggestion = {
        id: `suggestion-${Date.now()}`,
        name: formData.name,
        location: formData.location,
        description: formData.description,
        votes: 0,
        userVote: null,
        suggestedBy: "You",
        avatar: "/diverse-avatars.png",
        createdAt: new Date().toISOString(),
      }

      // Add to the list of suggestions
      onAddSuggestion(newSuggestion)

      // Send email notification to group members
      await sendEmailNotification(newSuggestion)

      // Reset form and close dialog
      setFormData({ name: "", location: "", description: "" })
      setOpen(false)

      // Show success toast
      toast({
        title: "Activity suggested!",
        description: "Other trip members have been notified and can now vote on your suggestion.",
      })
    } catch (error) {
      console.error("Error submitting suggestion:", error)
      toast({
        title: "Error submitting suggestion",
        description: "There was a problem submitting your suggestion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendEmailNotification = async (suggestion) => {
    // In a real app, this would be a server action or API call
    // For demo purposes, we'll simulate a successful email send
    return new Promise((resolve) => setTimeout(resolve, 500))
  }

  const handleAddEnhancedSuggestion = (suggestion) => {
    setFormData({
      name: suggestion.name,
      location: suggestion.location,
      description: suggestion.description,
    })
    setShowEnhanced(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Suggest Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest an Activity</DialogTitle>
          <DialogDescription>
            Share your ideas for activities in Barcelona. Other trip members can vote on your suggestion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity-name" className="text-right">
                Name
              </Label>
              <Input
                id="activity-name"
                placeholder="Activity name"
                className="col-span-3"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity-location" className="text-right">
                Location
              </Label>
              <Input
                id="activity-location"
                placeholder="Activity location"
                className="col-span-3"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="activity-description"
                placeholder="Describe the activity..."
                className="col-span-3"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enhanced-toggle" className="text-right">
                Enhanced Suggestions
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="enhanced-toggle" checked={showEnhanced} onCheckedChange={setShowEnhanced} />
                <Label htmlFor="enhanced-toggle" className="text-sm text-muted-foreground">
                  Get AI-powered activity suggestions based on your interests
                </Label>
              </div>
            </div>

            {showEnhanced && (
              <div className="border rounded-md p-4 mt-2">
                <div className="flex items-center mb-3">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  <h4 className="font-medium">Enhanced Suggestions for You</h4>
                </div>
                <div className="space-y-3">
                  {enhancedSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <h5 className="font-medium">{suggestion.name}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleAddEnhancedSuggestion(suggestion)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.location}</p>
                      <p className="text-xs mt-1 text-primary">{suggestion.match}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Client component for voting on activities
function ActivityVoting({ activity, onVoteChange }) {
  const [vote, setVote] = useState(activity.userVote)
  const [voteCount, setVoteCount] = useState(activity.votes)

  const handleVote = (voteType) => {
    let newVote = voteType
    let newCount = voteCount

    if (vote === voteType) {
      // Removing the vote
      newVote = null
      newCount = voteType === "up" ? voteCount - 1 : voteCount + 1
    } else {
      // Changing vote or adding new vote
      const oldVoteEffect = vote ? (vote === "up" ? -1 : 1) : 0
      const newVoteEffect = voteType === "up" ? 1 : -1
      newCount = voteCount + oldVoteEffect + newVoteEffect
    }

    setVote(newVote)
    setVoteCount(newCount)

    // Notify parent component about the vote change
    if (onVoteChange) {
      onVoteChange(newVote, newCount)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className={vote === "up" ? "text-green-600" : ""}
        onClick={() => handleVote("up")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <span className="font-medium">{voteCount}</span>
      <Button
        variant="ghost"
        size="sm"
        className={vote === "down" ? "text-red-600" : ""}
        onClick={() => handleVote("down")}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Main client component for the Activities tab
export function TripActivitySuggestions({
  activities: initialActivities,
  suggestedActivities: initialSuggestedActivities,
}) {
  const [activities] = useState(initialActivities)
  const [suggestedActivities, setSuggestedActivities] = useState(initialSuggestedActivities)

  // Sort suggested activities by vote count (most popular first)
  useEffect(() => {
    const sortedActivities = [...suggestedActivities].sort((a, b) => b.votes - a.votes)
    setSuggestedActivities(sortedActivities)
  }, [])

  const handleAddSuggestion = (newSuggestion) => {
    setSuggestedActivities((prev) => {
      // Add the new suggestion and sort by votes
      const updated = [...prev, newSuggestion]
      return updated.sort((a, b) => b.votes - a.votes)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Planned Activities</CardTitle>
          <CardDescription>Your itinerary for the trip</CardDescription>
        </div>
        <SuggestActivityDialog onAddSuggestion={handleAddSuggestion} />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Confirmed Activities</h3>
          {activities.map((activity, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden">
              <div className="relative h-48 md:h-auto md:w-1/3">
                <Image src={activity.image || "/placeholder.svg"} alt={activity.name} fill className="object-cover" />
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-medium text-lg mb-1">{activity.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{activity.time}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{activity.location}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Suggested Activities</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vote on activities suggested by trip members. The most popular suggestions will be added to the itinerary.
            </p>

            {suggestedActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{activity.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{activity.location}</p>
                  </div>
                  <ActivityVoting
                    activity={activity}
                    onVoteChange={(newVote, newCount) => {
                      // Update the activity's vote count
                      setSuggestedActivities((prev) => {
                        const updated = prev.map((a) =>
                          a.id === activity.id ? { ...a, userVote: newVote, votes: newCount } : a,
                        )
                        // Re-sort by votes
                        return updated.sort((a, b) => b.votes - a.votes)
                      })
                    }}
                  />
                </div>
                <p className="text-sm mt-2">{activity.description}</p>
                <div className="flex items-center mt-3">
                  <p className="text-xs text-muted-foreground">Suggested by:</p>
                  <Avatar className="h-5 w-5 ml-2">
                    <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.suggestedBy} />
                    <AvatarFallback>{activity.suggestedBy[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs ml-1">{activity.suggestedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

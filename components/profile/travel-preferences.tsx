import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Umbrella, Mountain, Building, Landmark } from "lucide-react"

interface TravelPreferencesProps {
  userId: string
}

export function TravelPreferences({ userId }: TravelPreferencesProps) {
  // In a real app, we would fetch this data from the database
  // For now, we'll use mock data
  const mockPreferences = {
    destinationTypes: [
      { name: "Beach", percentage: 35, icon: <Umbrella size={16} /> },
      { name: "Mountains", percentage: 25, icon: <Mountain size={16} /> },
      { name: "City", percentage: 20, icon: <Building size={16} /> },
      { name: "Cultural", percentage: 20, icon: <Landmark size={16} /> },
    ],
    interests: [
      { name: "Photography", frequency: "high" },
      { name: "Food", frequency: "high" },
      { name: "Hiking", frequency: "medium" },
      { name: "Museums", frequency: "medium" },
      { name: "Shopping", frequency: "low" },
    ],
    favoriteSeason: "Summer",
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "high":
        return "bg-green-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProgressColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500"]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Destination Preferences</h3>
          <div className="space-y-3">
            {mockPreferences.destinationTypes.map((type, index) => (
              <div key={type.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    {type.icon}
                    <span>{type.name}</span>
                  </div>
                  <span>{type.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(index)}`} style={{ width: `${type.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Travel Interests</h3>
          <div className="flex flex-wrap gap-2">
            {mockPreferences.interests.map((interest) => (
              <Badge key={interest.name} variant="outline" className="flex items-center gap-1">
                {interest.name}
                <span className={`h-2 w-2 rounded-full ${getFrequencyColor(interest.frequency)}`}></span>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Favorite Travel Season</h3>
          <div className="grid grid-cols-4 gap-2">
            {["Spring", "Summer", "Fall", "Winter"].map((season) => (
              <div
                key={season}
                className={`text-center py-2 px-1 rounded-md text-sm ${
                  season === mockPreferences.favoriteSeason
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {season}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

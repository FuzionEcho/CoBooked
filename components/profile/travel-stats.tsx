"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Plane, Route } from "lucide-react"

interface TravelStatsProps {
  userId: string
}

export function TravelStats({ userId }: TravelStatsProps) {
  // In a real app, we would fetch this data from the database
  // For now, we'll use mock data
  const mockStats = {
    milesTraveled: 24750,
    placesVisited: 12,
    tripsTaken: 8,
    travelCompanions: 15,
  }

  const [stats, setStats] = useState({
    milesTraveled: 0,
    placesVisited: 0,
    tripsTaken: 0,
    travelCompanions: 0,
  })

  // Animate the counters
  useEffect(() => {
    const duration = 1500
    const frameDuration = 1000 / 60
    const totalFrames = Math.round(duration / frameDuration)

    let frame = 0
    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames

      setStats({
        milesTraveled: Math.floor(mockStats.milesTraveled * Math.min(progress, 1)),
        placesVisited: Math.floor(mockStats.placesVisited * Math.min(progress, 1)),
        tripsTaken: Math.floor(mockStats.tripsTaken * Math.min(progress, 1)),
        travelCompanions: Math.floor(mockStats.travelCompanions * Math.min(progress, 1)),
      })

      if (frame === totalFrames) {
        clearInterval(timer)
      }
    }, frameDuration)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <Route size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miles Traveled</p>
              <p className="text-2xl font-bold">{stats.milesTraveled.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Places Visited</p>
              <p className="text-2xl font-bold">{stats.placesVisited}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <Plane size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trips Taken</p>
              <p className="text-2xl font-bold">{stats.tripsTaken}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-300">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Travel Companions</p>
              <p className="text-2xl font-bold">{stats.travelCompanions}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

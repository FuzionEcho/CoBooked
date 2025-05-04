"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { formatPrice } from "@/lib/utils"
import { Loader2, PiggyBank, Plane, Hotel, Utensils, Ticket } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CostEstimationProps {
  tripId: string
  destination: string
}

interface CostBreakdown {
  flights: number
  accommodation: number
  food: number
  activities: number
  total: number
  currency: string
  perPerson: number
}

export function CostEstimation({ tripId, destination }: CostEstimationProps) {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [costs, setCosts] = useState<CostBreakdown>({
    flights: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    total: 0,
    currency: "USD",
    perPerson: 0,
  })
  const [memberCount, setMemberCount] = useState(1)
  const [userBudget, setUserBudget] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get member count
        const { count } = await supabase
          .from("trip_members")
          .select("*", { count: "exact", head: true })
          .eq("trip_id", tripId)

        if (count) {
          setMemberCount(count)
        }

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get user budget
          const { data: preferences } = await supabase
            .from("trip_preferences")
            .select("budget")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .single()

          if (preferences?.budget) {
            setUserBudget(preferences.budget)
          }
        }

        // Generate mock cost estimation based on destination
        // In a real app, this would use actual saved flight/hotel data
        const destinationFactor = destination.toLowerCase().includes("tokyo")
          ? 1.5
          : destination.toLowerCase().includes("bali")
            ? 0.7
            : destination.toLowerCase().includes("barcelona")
              ? 1.0
              : 1.0

        const flightCost = Math.round(400 * destinationFactor)
        const accommodationCost = Math.round(100 * destinationFactor * 4) // 4 nights
        const foodCost = Math.round(50 * destinationFactor * 5) // 5 days
        const activitiesCost = Math.round(80 * destinationFactor * 3) // 3 activities

        const totalCost = flightCost + accommodationCost + foodCost + activitiesCost

        setCosts({
          flights: flightCost,
          accommodation: accommodationCost,
          food: foodCost,
          activities: activitiesCost,
          total: totalCost,
          currency: "USD",
          perPerson: totalCost,
        })
      } catch (error) {
        console.error("Error fetching cost data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, tripId, destination])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const budgetPercentage = userBudget ? Math.min(Math.round((costs.total / userBudget) * 100), 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Trip Cost Estimation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Flights</span>
            <span className="ml-auto font-medium">{formatPrice(costs.flights, costs.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Accommodation</span>
            <span className="ml-auto font-medium">{formatPrice(costs.accommodation, costs.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Food</span>
            <span className="ml-auto font-medium">{formatPrice(costs.food, costs.currency)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Activities</span>
            <span className="ml-auto font-medium">{formatPrice(costs.activities, costs.currency)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Estimated Cost</span>
            <span className="font-bold text-lg">{formatPrice(costs.total, costs.currency)}</span>
          </div>
          <div className="text-sm text-muted-foreground text-right">per person for a 5-day trip</div>
        </div>

        {userBudget && (
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Budget</span>
              <span className="font-medium">{formatPrice(userBudget, costs.currency)}</span>
            </div>
            <Progress value={budgetPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{budgetPercentage}% of your budget</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

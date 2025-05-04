"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Share2, Copy, MapPin, Calendar, Users, PlaneTakeoff, Plane } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { TripJoinQR } from "@/components/trip-join-qr"

interface TripDetailsProps {
  trip: any
  userRole: string
  currentUserId: string
}

export function TripDetails({ trip, userRole, currentUserId }: TripDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [destinationName, setDestinationName] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState<number | null>(null)

  // Fetch destination name and member count
  useState(() => {
    async function fetchAdditionalData() {
      if (trip.selected_destination_id) {
        const { data } = await supabase
          .from("destinations")
          .select("name")
          .eq("id", trip.selected_destination_id)
          .single()

        if (data) {
          setDestinationName(data.name)
        }
      }

      const { count } = await supabase
        .from("trip_members")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", trip.id)

      setMemberCount(count || 0)
    }

    fetchAdditionalData()
  })

  const copyJoinCode = () => {
    navigator.clipboard.writeText(trip.join_code)
    toast({
      title: "Copied!",
      description: "Join code copied to clipboard",
    })
  }

  const copyJoinLink = () => {
    const joinLink = `${window.location.origin}/trips/join?code=${trip.join_code}`
    navigator.clipboard.writeText(joinLink)
    toast({
      title: "Copied!",
      description: "Join link copied to clipboard",
    })
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <Badge
              variant={trip.status === "planning" ? "outline" : trip.status === "active" ? "default" : "secondary"}
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{trip.description || "No description provided"}</p>
        </div>
        <div className="flex gap-2">
          {trip.selected_destination_id && (
            <Button variant="default" asChild>
              <Link href={`/trips/${trip.id}/plan`} className="flex items-center gap-2">
                <PlaneTakeoff className="h-4 w-4" />
                Plan Trip
              </Link>
            </Button>
          )}
          {trip.selected_destination_id && (
            <Button variant="outline" asChild>
              <Link href={`/trips/${trip.id}/flights`} className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flights
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          {userRole === "owner" && (
            <Button variant="outline" onClick={() => router.push(`/trips/${trip.id}/edit`)}>
              Edit Trip
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{destinationName || "Not selected yet"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(trip.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{memberCount || 0} participants</p>
              </div>
            </div>
          </div>
          {trip.owner_id === currentUserId && (
            <div className="mt-6">
              <TripJoinQR joinCode={trip.join_code} tripName={trip.name} />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Trip</DialogTitle>
            <DialogDescription>Invite your friends to join this trip using the code or link below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Join Code</p>
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-md text-center flex-1 font-mono text-lg">{trip.join_code}</div>
                <Button size="icon" variant="outline" onClick={copyJoinCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Share Link</p>
              <div className="flex items-center gap-2">
                <div className="bg-muted p-2 rounded-md text-sm truncate flex-1">
                  {`${window.location.origin}/trips/join?code=${trip.join_code}`}
                </div>
                <Button size="icon" variant="outline" onClick={copyJoinLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

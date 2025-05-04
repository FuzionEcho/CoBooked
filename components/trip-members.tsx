"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Member {
  id: string
  user_id: string
  role: string
  profile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
    email?: string
  }
}

interface TripMembersProps {
  tripId: string
  userRole: string
}

export function TripMembers({ tripId, userRole }: TripMembersProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMembers() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        // Get trip members with profiles
        const { data, error } = await supabase
          .from("trip_members")
          .select(`
            id,
            user_id,
            role,
            profiles:user_id (
              full_name,
              username,
              avatar_url
            )
          `)
          .eq("trip_id", tripId)

        if (error) throw error

        // For each member, get their email if they don't have a profile
        const membersWithEmail = await Promise.all(
          (data || []).map(async (member) => {
            if (!member.profiles) {
              const { data: userData } = await supabase.auth.admin.getUserById(member.user_id)
              return {
                ...member,
                profile: {
                  full_name: null,
                  username: null,
                  avatar_url: null,
                  email: userData?.user?.email,
                },
              }
            }
            return {
              ...member,
              profile: member.profiles,
            }
          }),
        )

        setMembers(membersWithEmail)
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()

    // Set up real-time subscription for member changes
    const channel = supabase
      .channel("trip_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_members",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchMembers()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tripId])

  const removeMember = async (memberId: string, memberUserId: string) => {
    try {
      // Check if trying to remove self
      if (memberUserId === currentUserId && userRole !== "owner") {
        toast({
          title: "Error",
          description: "You cannot remove yourself from the trip.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("trip_members").delete().eq("id", memberId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Member removed from trip.",
      })

      // If removing self, redirect to trips page
      if (memberUserId === currentUserId) {
        window.location.href = "/trips"
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      })
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
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trip Members ({members.length})</h3>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profile.full_name
                      ? member.profile.full_name.charAt(0).toUpperCase()
                      : member.profile.email
                        ? member.profile.email.charAt(0).toUpperCase()
                        : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.profile.full_name || member.profile.username || member.profile.email || "Unknown User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.user_id === currentUserId ? "You" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "owner" ? "default" : "outline"}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                {(userRole === "owner" || member.user_id === currentUserId) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          {member.user_id === currentUserId
                            ? "Are you sure you want to leave this trip? This action cannot be undone."
                            : "Are you sure you want to remove this member from the trip? This action cannot be undone."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeMember(member.id, member.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {member.user_id === currentUserId ? "Leave Trip" : "Remove"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

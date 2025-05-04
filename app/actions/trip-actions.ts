"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function joinTripByCode(joinCode: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to join a trip.",
        redirectTo: "/login",
      }
    }

    // Find the trip with the join code
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("join_code", joinCode.toUpperCase())
      .single()

    if (tripError) {
      return {
        success: false,
        error: "Invalid join code. Please check and try again.",
      }
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from("trip_members")
      .select("*")
      .eq("trip_id", trip.id)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return {
        success: true,
        message: "You are already a member of this trip.",
        tripId: trip.id,
        tripName: trip.name,
        alreadyMember: true,
      }
    }

    // Add user as a member
    const { error: joinError } = await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "member",
    })

    if (joinError) {
      return {
        success: false,
        error: "Failed to join the trip. Please try again.",
      }
    }

    // Revalidate the trips page
    revalidatePath("/trips")

    return {
      success: true,
      message: "You have successfully joined the trip.",
      tripId: trip.id,
      tripName: trip.name,
    }
  } catch (error) {
    console.error("Error joining trip:", error)
    return {
      success: false,
      error: "An unexpected error occurred while joining the trip.",
    }
  }
}

export async function generateTripJoinCode() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Generate a random 5-character code (3 letters + 2 numbers)
  const generateCode = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ" // Removed I and O to avoid confusion
    const numbers = "123456789" // Removed 0 to avoid confusion

    let code = ""

    // Add 3 random letters
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length))
    }

    // Add 2 random numbers
    for (let i = 0; i < 2; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }

    return code
  }

  // Try to generate a unique code (max 10 attempts)
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode()

    // Check if code already exists
    const { data, error } = await supabase.from("trips").select("id").eq("join_code", code).single()

    if (error && !data) {
      // Code doesn't exist, we can use it
      return { code }
    }
  }

  // If we couldn't generate a unique code after 10 attempts
  return { error: "Could not generate a unique join code. Please try again." }
}

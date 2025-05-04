import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// This script would be run manually or during deployment
// It adds an admin role to a specified user

export async function addAdminRole(email: string) {
  // In a real application, these would come from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials")
    return
  }

  // Create a Supabase client with the service role key
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  try {
    // First, check if the user exists
    const { data: userData, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      console.error("User not found:", userError?.message || "No user with that email")
      return
    }

    // Update the user's profile to have admin role
    const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userData.id)

    if (updateError) {
      console.error("Failed to update user role:", updateError.message)
      return
    }

    console.log(`Successfully granted admin role to user: ${email}`)
  } catch (error) {
    console.error("Error in addAdminRole:", error)
  }
}

// Example usage (would be called from a secure context):
// addAdminRole('admin@tripmate.com')

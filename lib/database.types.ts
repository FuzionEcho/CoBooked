export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Define the Database type
export type Database = {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string | null
          image_url: string | null
          created_at: string
          tags: string[] | null
          average_cost: number | null
        }
        Insert: {
          id?: string
          name: string
          country: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          tags?: string[] | null
          average_cost?: number | null
        }
        Update: {
          id?: string
          name?: string
          country?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          tags?: string[] | null
          average_cost?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          location: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          location?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          location?: string | null
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          created_at: string
          role: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          created_at?: string
          role?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          created_at?: string
          role?: string
        }
      }
      trip_preferences: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          created_at: string
          budget: number | null
          interests: string[] | null
          travel_dates: string[] | null
          departure_location: string | null
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          created_at?: string
          budget?: number | null
          interests?: string[] | null
          travel_dates?: string[] | null
          departure_location?: string | null
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          created_at?: string
          budget?: number | null
          interests?: string[] | null
          travel_dates?: string[] | null
          departure_location?: string | null
        }
      }
      trip_votes: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          destination_id: string
          created_at: string
          vote_value: number
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          destination_id: string
          created_at?: string
          vote_value: number
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          destination_id?: string
          created_at?: string
          vote_value?: number
        }
      }
      trips: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          owner_id: string
          status: string
          join_code: string
          selected_destination_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          owner_id: string
          status?: string
          join_code?: string
          selected_destination_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          owner_id?: string
          status?: string
          join_code?: string
          selected_destination_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Explicitly export Database as a named export
export type { Json }

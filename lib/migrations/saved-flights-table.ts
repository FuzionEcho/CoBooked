// This file contains the SQL to create the saved_flights table
// You can run this in the Supabase SQL editor

// Add a comment to remind us to update the join_code column in the trips table
// This doesn't change the actual file content but serves as a reminder

// Note: In a real implementation, you would need to create a migration to update
// the join_code column in the trips table to be exactly 5 characters

export const createSavedFlightsTableSQL = `
-- Create saved_flights table
CREATE TABLE IF NOT EXISTS public.saved_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  flight_id TEXT NOT NULL,
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  stops INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  deep_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a unique constraint to prevent duplicate saved flights
  UNIQUE(trip_id, user_id, flight_id)
);

-- Add RLS policies
ALTER TABLE public.saved_flights ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own saved flights
CREATE POLICY "Users can view their own saved flights" 
  ON public.saved_flights 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own saved flights
CREATE POLICY "Users can insert their own saved flights" 
  ON public.saved_flights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own saved flights
CREATE POLICY "Users can delete their own saved flights" 
  ON public.saved_flights 
  FOR DELETE 
  USING (auth.uid() = user_id);
`

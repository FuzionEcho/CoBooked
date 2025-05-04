import { redirect } from "next/navigation"
import Image from "next/image"
import { getSession } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Plane, Hotel, Utensils, Camera } from "lucide-react"
import { TripActivitySuggestions } from "@/components/trip-activity-suggestions"

// Mock trip data
const MOCK_TRIP = {
  id: "mock-trip-123",
  name: "Barcelona Adventure 2023",
  description: "Exploring the beautiful city of Barcelona, including La Sagrada Familia and other Gaudí masterpieces.",
  destination: "Barcelona, Spain",
  startDate: "2023-08-15",
  endDate: "2023-08-22",
  image: "/barcelona-cityscape.jpg",
  creator: {
    name: "Alex Rivera",
    avatar: "/diverse-group.png",
  },
  members: [
    {
      name: "Alex Rivera",
      avatar: "/diverse-group.png",
      role: "organizer",
    },
    {
      name: "Jamie Smith",
      avatar: "/diverse-person-smiling.png",
      role: "member",
    },
    {
      name: "Taylor Wong",
      avatar: "/placeholder.svg?key=5ayby",
      role: "member",
    },
    {
      name: "You",
      avatar: "/diverse-person-profiles.png",
      role: "member",
      isCurrentUser: true,
    },
  ],
  activities: [
    {
      name: "La Sagrada Familia Tour",
      date: "2023-08-16",
      time: "10:00 AM",
      location: "La Sagrada Familia",
      image: "/placeholder.svg?key=kaqhe",
    },
    {
      name: "Park Güell Visit",
      date: "2023-08-17",
      time: "9:30 AM",
      location: "Park Güell",
      image: "/placeholder.svg?key=wwj9b",
    },
    {
      name: "Beach Day",
      date: "2023-08-18",
      time: "11:00 AM",
      location: "Barceloneta Beach",
      image: "/placeholder.svg?key=u2df1",
    },
    {
      name: "Tapas Cooking Class",
      date: "2023-08-19",
      time: "6:00 PM",
      location: "Barcelona Cooking School",
      image: "/placeholder.svg?key=e7jbj",
    },
  ],
  suggestedActivities: [
    {
      id: "sug-1",
      name: "Picasso Museum Tour",
      description: "Explore the works of Pablo Picasso in this comprehensive museum dedicated to the artist.",
      location: "Carrer Montcada, 15-23, Barcelona",
      suggestedBy: "Jamie Smith",
      avatar: "/diverse-person-smiling.png",
      votes: 2,
      userVote: null,
    },
    {
      id: "sug-2",
      name: "Montjuïc Cable Car Ride",
      description: "Take a scenic cable car ride to Montjuïc Castle for panoramic views of the city and sea.",
      location: "Avinguda Miramar, Barcelona",
      suggestedBy: "Taylor Wong",
      avatar: "/placeholder.svg?key=5ayby",
      votes: 3,
      userVote: "up",
    },
    {
      id: "sug-3",
      name: "Flamenco Show at Tablao Cordobés",
      description: "Experience authentic Spanish culture with a traditional flamenco performance.",
      location: "La Rambla, 35, Barcelona",
      suggestedBy: "Alex Rivera",
      avatar: "/diverse-group.png",
      votes: 1,
      userVote: "down",
    },
  ],
  flights: [
    {
      airline: "Iberia",
      flightNumber: "IB2742",
      departure: "JFK",
      arrival: "BCN",
      departureDate: "2023-08-15",
      departureTime: "18:30",
      arrivalDate: "2023-08-16",
      arrivalTime: "08:45",
      price: 750,
    },
    {
      airline: "Iberia",
      flightNumber: "IB2743",
      departure: "BCN",
      arrival: "JFK",
      departureDate: "2023-08-22",
      departureTime: "10:15",
      arrivalDate: "2023-08-22",
      arrivalTime: "13:30",
      price: 780,
    },
  ],
  hotels: [
    {
      name: "Hotel Barcelona Center",
      address: "Carrer de Balmes, 103, 08008 Barcelona",
      checkIn: "2023-08-16",
      checkOut: "2023-08-22",
      pricePerNight: 180,
      image: "/placeholder.svg?key=2pa1j",
      amenities: ["Free WiFi", "Pool", "Breakfast included", "Air conditioning"],
    },
  ],
}

export default async function MockTripPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      {/* Trip Header */}
      <div className="relative h-64 rounded-lg overflow-hidden mb-6">
        <Image src={MOCK_TRIP.image || "/placeholder.svg"} alt={MOCK_TRIP.destination} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{MOCK_TRIP.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{MOCK_TRIP.destination}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date(MOCK_TRIP.startDate).toLocaleDateString()} -{" "}
                {new Date(MOCK_TRIP.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{MOCK_TRIP.members.length} travelers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Content */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Trip Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{MOCK_TRIP.description}</p>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Trip Highlights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Plane className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Direct Flights</h4>
                        <p className="text-sm text-muted-foreground">JFK to Barcelona</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Hotel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Centrally Located Hotel</h4>
                        <p className="text-sm text-muted-foreground">Walking distance to attractions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Utensils className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Culinary Experiences</h4>
                        <p className="text-sm text-muted-foreground">Tapas cooking class included</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Guided Tours</h4>
                        <p className="text-sm text-muted-foreground">Skip-the-line access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Destination</h3>
                  <p className="text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {MOCK_TRIP.destination}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Dates</h3>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {new Date(MOCK_TRIP.startDate).toLocaleDateString()} -{" "}
                    {new Date(MOCK_TRIP.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Duration</h3>
                  <p className="text-sm">8 days, 7 nights</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Organizer</h3>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={MOCK_TRIP.creator.avatar || "/placeholder.svg"} alt={MOCK_TRIP.creator.name} />
                      <AvatarFallback>{MOCK_TRIP.creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{MOCK_TRIP.creator.name}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Trip Status</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Confirmed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Members</CardTitle>
              <CardDescription>People joining this adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_TRIP.members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.name}
                          {member.isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === "organizer" ? "default" : "outline"}>
                      {member.role === "organizer" ? "Organizer" : "Member"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flights Tab */}
        <TabsContent value="flights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flight Information</CardTitle>
              <CardDescription>Your confirmed flight bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {MOCK_TRIP.flights.map((flight, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {i === 0 ? "Outbound" : "Return"}
                        </Badge>
                        <h3 className="font-medium">
                          {flight.airline} {flight.flightNumber}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">${flight.price}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.departure}</p>
                        <p className="text-sm">{flight.departureTime}</p>
                        <p className="text-xs text-muted-foreground">{flight.departureDate}</p>
                      </div>

                      <div className="flex-1 mx-4">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dashed"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <Plane className="h-5 w-5 rotate-90 bg-background px-1" />
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.arrival}</p>
                        <p className="text-sm">{flight.arrivalTime}</p>
                        <p className="text-xs text-muted-foreground">{flight.arrivalDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accommodations Tab */}
        <TabsContent value="accommodations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Booking</CardTitle>
              <CardDescription>Your confirmed accommodation</CardDescription>
            </CardHeader>
            <CardContent>
              {MOCK_TRIP.hotels.map((hotel, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{hotel.address}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Check-in</p>
                        <p className="text-sm">{new Date(hotel.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Check-out</p>
                        <p className="text-sm">{new Date(hotel.checkOut).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Price per night</p>
                        <p className="text-sm">${hotel.pricePerNight}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total (7 nights)</p>
                        <p className="text-sm">${hotel.pricePerNight * 7}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, j) => (
                          <Badge key={j} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <TripActivitySuggestions
            activities={MOCK_TRIP.activities}
            suggestedActivities={MOCK_TRIP.suggestedActivities}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

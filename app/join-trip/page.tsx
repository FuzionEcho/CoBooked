"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2, QrCode, Scan, ArrowLeft, CheckCircle2, Users, Calendar, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

// Mock trip data for ABC12 code
const MOCK_TRIP = {
  id: "mock-trip-123",
  name: "Barcelona Adventure 2023",
  description: "Exploring the beautiful city of Barcelona, including La Sagrada Familia and other Gaudí masterpieces.",
  destination: "Barcelona, Spain",
  startDate: "2023-08-15",
  endDate: "2023-08-22",
  image: "/barcelona-cityscape.jpg", // Use the Barcelona image we added
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
      avatar: "/placeholder.svg?key=ubc2u",
      role: "member",
    },
  ],
  activities: ["La Sagrada Familia Tour", "Park Güell Visit", "Beach Day", "Tapas Cooking Class"],
}

export default function JoinTripPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [joinCode, setJoinCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tripName, setTripName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showMockTrip, setShowMockTrip] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-format join code to uppercase
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
    setJoinCode(value)
    // Clear any previous errors when user types
    if (error) setError(null)

    // Check if code is ABC12 and show mock trip
    if (value === "ABC12") {
      setShowMockTrip(true)
    } else {
      setShowMockTrip(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning()
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [])

  const handleJoinTrip = async (e?: React.FormEvent) => {
    // Prevent form submission if called from a form
    if (e) e.preventDefault()

    setError(null)

    // If called from the mock trip view, we already know the code is ABC12
    const codeToUse = showMockTrip ? "ABC12" : joinCode

    if (codeToUse.length !== 5) {
      setError("Please enter a valid 5-character trip code.")
      return
    }

    // Special handling for ABC12 code
    if (codeToUse === "ABC12") {
      setIsLoading(true)

      // For demo purposes, just simulate success and redirect
      setTimeout(() => {
        setIsLoading(false)
        setTripName(MOCK_TRIP.name)
        setSuccess(true)

        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/trips/mock-trip-123`)
        }, 2000)
      }, 1500)

      return
    }

    setIsLoading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to join a trip.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        return
      }

      // Find the trip with the join code
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("join_code", codeToUse)
        .single()

      if (tripError) {
        setError("Invalid join code. Please check and try again.")
        return
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("trip_members")
        .select("*")
        .eq("trip_id", trip.id)
        .eq("user_id", user.id)
        .single()

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this trip.",
        })
        router.push(`/trips/${trip.id}`)
        return
      }

      // Add user as a member
      const { error: joinError } = await supabase.from("trip_members").insert({
        trip_id: trip.id,
        user_id: user.id,
        role: "member",
      })

      if (joinError) throw joinError

      // Revalidate both trips and profile pages to update the UI
      fetch("/api/revalidate?path=/trips&path=/profile", {
        method: "POST",
      }).catch(console.error)

      // Show success state
      setTripName(trip.name)
      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/trips/${trip.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error joining trip:", error)
      setError("An unexpected error occurred while joining the trip.")
    } finally {
      setIsLoading(false)
    }
  }

  const startScanning = async () => {
    setIsScanning(true)
    setError(null)

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          // Start scanning for QR codes
          scanQRCode()
        }
      } else {
        setError("Camera access is not supported in your browser.")
        setIsScanning(false)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("Could not access your camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // In a real implementation, we would use a library like jsQR
    // For this example, we'll simulate finding a code with a more realistic approach
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.height = videoRef.current.videoHeight
        canvas.width = videoRef.current.videoWidth
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Simulate QR code detection with random chance
        if (Math.random() < 0.2) {
          // 20% chance each check
          // Always return ABC12 for the demo
          const randomCode = "ABC12"
          setJoinCode(randomCode)
          setShowMockTrip(true)
          stopScanning()
          toast({
            title: "QR Code Detected",
            description: `Found trip code: ${randomCode}`,
          })
        }
      }
    }, 500) // Check every 500ms
  }

  // If success state is active, show success screen
  if (success) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-2xl mb-2">Successfully Joined!</CardTitle>
                <CardDescription className="text-base mb-6">
                  You have joined <span className="font-semibold">{tripName}</span>
                </CardDescription>
                <p className="text-sm text-muted-foreground mb-4">Redirecting you to the trip page...</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // If showing mock trip details
  if (showMockTrip) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <Image
                src={MOCK_TRIP.image || "/placeholder.svg"}
                alt={MOCK_TRIP.destination}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white"
                onClick={() => {
                  setShowMockTrip(false)
                  setJoinCode("")
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{MOCK_TRIP.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" /> {MOCK_TRIP.destination}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <Calendar className="h-3 w-3 mr-1" /> 8 Days
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Trip Description</h3>
                <p className="text-sm text-muted-foreground">{MOCK_TRIP.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Trip Dates</h3>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {new Date(MOCK_TRIP.startDate).toLocaleDateString()} -{" "}
                    {new Date(MOCK_TRIP.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Trip Organizer</h3>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={MOCK_TRIP.creator.avatar || "/placeholder.svg"} alt={MOCK_TRIP.creator.name} />
                    <AvatarFallback>{MOCK_TRIP.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{MOCK_TRIP.creator.name}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Members ({MOCK_TRIP.members.length})</h3>
                <div className="flex -space-x-2">
                  {MOCK_TRIP.members.map((member, i) => (
                    <Avatar key={i} className="border-2 border-background">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Planned Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {MOCK_TRIP.activities.map((activity, i) => (
                    <Badge key={i} variant="secondary">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button className="w-full" onClick={() => handleJoinTrip()} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Trip...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Join This Trip
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Join a Trip</CardTitle>
            </div>
            <CardDescription>
              Enter the 5-character code or scan the QR code provided by the trip creator
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="code">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Enter Code</TabsTrigger>
              <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <form onSubmit={handleJoinTrip}>
                <CardContent className="space-y-4 pt-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert variant="destructive" className="mb-4">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="joinCode">5-Character Trip Code</Label>
                    <Input
                      id="joinCode"
                      placeholder="ABC12"
                      value={joinCode}
                      onChange={handleCodeChange}
                      required
                      className="text-center text-lg uppercase tracking-wider font-mono"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 5-character code (letters and numbers)
                      <span className="block mt-1 text-primary">Try "ABC12" for a demo trip!</span>
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || joinCode.length !== 5}
                    className="relative overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Continue"
                    )}
                    {!isLoading && joinCode.length === 5 && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                      />
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="scan">
              <CardContent className="space-y-4 pt-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  {isScanning ? (
                    <>
                      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="h-48 w-48 border-2 border-primary/70 rounded-lg"
                          initial={{ opacity: 0.5, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            duration: 1.5,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <QrCode className="h-16 w-16 mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center px-4">
                        Position the QR code within the frame to scan
                      </p>
                    </div>
                  )}
                </div>

                {joinCode && (
                  <div className="bg-muted p-3 rounded-md text-center">
                    <p className="text-sm font-medium mb-1">Detected Code:</p>
                    <p className="text-lg font-mono tracking-wider">{joinCode}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                {joinCode ? (
                  <Button type="button" onClick={() => handleJoinTrip()} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={isScanning ? stopScanning : startScanning}
                    variant={isScanning ? "destructive" : "default"}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Stop Scanning
                      </>
                    ) : (
                      <>
                        <Scan className="mr-2 h-4 w-4" />
                        Start Scanning
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

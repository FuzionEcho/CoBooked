"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2, QrCode, Scan } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Removed import of CollaborativeSwiper if it existed

export default function JoinTripPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [joinCode, setJoinCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleJoinTrip = async (e: React.FormEvent) => {
    e.preventDefault()

    if (joinCode.length !== 5) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 5-character trip code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to join a trip.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // Find the trip with the join code
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("join_code", joinCode.toUpperCase())
        .single()

      if (tripError) {
        toast({
          title: "Error",
          description: "Invalid join code. Please check and try again.",
          variant: "destructive",
        })
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
          title: "Info",
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

      toast({
        title: "Success",
        description: "You have successfully joined the trip.",
      })

      router.push(`/trips/${trip.id}`)
    } catch (error) {
      console.error("Error joining trip:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while joining the trip.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startScanning = async () => {
    setIsScanning(true)

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          // Start scanning for QR codes
          scanQRCode()
        }
      } else {
        toast({
          title: "Error",
          description: "Camera access is not supported in your browser.",
          variant: "destructive",
        })
        setIsScanning(false)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const checkVideoFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.height = videoRef.current.videoHeight
        canvas.width = videoRef.current.videoWidth
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Here you would typically use a QR code scanning library
        // For this example, we'll simulate finding a code after 3 seconds
        setTimeout(() => {
          if (isScanning) {
            const simulatedCode = "ABC12"
            setJoinCode(simulatedCode)
            stopScanning()
            toast({
              title: "QR Code Detected",
              description: `Found trip code: ${simulatedCode}`,
            })
          }
        }, 3000)
      }

      if (isScanning) {
        requestAnimationFrame(checkVideoFrame)
      }
    }

    requestAnimationFrame(checkVideoFrame)
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Join a Trip</CardTitle>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">5-Character Trip Code</Label>
                    <Input
                      id="joinCode"
                      placeholder="ABC12"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      required
                      className="text-center text-lg uppercase tracking-wider"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground">Enter the 5-character code (letters and numbers)</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || joinCode.length !== 5}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Trip"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="scan">
              <CardContent className="space-y-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  {isScanning ? (
                    <>
                      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-48 w-48 border-2 border-white/50 rounded-lg"></div>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={isScanning ? stopScanning : startScanning}
                  className={isScanning ? "bg-red-500 hover:bg-red-600" : ""}
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
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

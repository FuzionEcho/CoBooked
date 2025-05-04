"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Download, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TripJoinQRProps {
  joinCode: string
  tripName: string
}

export function TripJoinQR({ joinCode, tripName }: TripJoinQRProps) {
  const { toast } = useToast()
  const [qrUrl, setQrUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate QR code using a free QR code API
    const generateQR = async () => {
      setIsLoading(true)
      try {
        // Using the Google Charts API to generate a QR code
        const url = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${joinCode}&choe=UTF-8`
        setQrUrl(url)
      } catch (error) {
        console.error("Error generating QR code:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (joinCode) {
      generateQR()
    }
  }, [joinCode])

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(joinCode)
    toast({
      title: "Copied!",
      description: "Trip code copied to clipboard",
    })
  }

  const downloadQR = () => {
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `${tripName.replace(/\s+/g, "-").toLowerCase()}-join-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareTrip = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my trip: ${tripName}`,
          text: `Join my trip on TripMate using code: ${joinCode}`,
          url: window.location.origin + "/join-trip",
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      copyCodeToClipboard()
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Share Trip</h3>

        {isLoading ? (
          <div className="w-full aspect-square bg-muted animate-pulse rounded-md mb-4" />
        ) : (
          <div className="mb-4 flex justify-center">
            <img
              src={qrUrl || "/placeholder.svg"}
              alt={`QR code for joining ${tripName}`}
              className="rounded-md border p-2 bg-white"
            />
          </div>
        )}

        <div className="bg-muted p-3 rounded-md mb-4">
          <p className="text-sm font-medium mb-1">Trip Code</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-mono tracking-wider">{joinCode}</p>
            <Button size="icon" variant="ghost" onClick={copyCodeToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={downloadQR} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Download QR
          </Button>
          <Button onClick={shareTrip}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

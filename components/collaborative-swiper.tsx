"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface CollaborativeSwipeProps {
  items?: Array<{
    id: string
    title: string
    description?: string
    imageUrl?: string
  }>
  onSwipe?: (id: string, direction: "left" | "right") => void
}

export default function CollaborativeSwiper({ items = [], onSwipe = () => {} }: CollaborativeSwipeProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const handleSwipe = (direction: "left" | "right") => {
    if (items.length > 0 && currentIndex < items.length) {
      onSwipe(items[currentIndex].id, direction)
      setCurrentIndex((prev) => Math.min(prev + 1, items.length))
    }
  }

  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center">No more items to swipe</p>
        </CardContent>
      </Card>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardContent className="p-6">
          {currentItem.imageUrl && (
            <div className="w-full h-48 bg-gray-200 rounded-md mb-4">
              <img
                src={currentItem.imageUrl || "/placeholder.svg"}
                alt={currentItem.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
          <h3 className="text-xl font-bold mb-2">{currentItem.title}</h3>
          {currentItem.description && <p className="text-gray-600 mb-4">{currentItem.description}</p>}
          <div className="flex justify-between">
            <button onClick={() => handleSwipe("left")} className="px-4 py-2 bg-red-500 text-white rounded-md">
              Dislike
            </button>
            <button onClick={() => handleSwipe("right")} className="px-4 py-2 bg-green-500 text-white rounded-md">
              Like
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

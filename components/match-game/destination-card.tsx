"use client"

import { useState, useRef } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import type { Destination } from "@/lib/match-game-data"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

interface DestinationCardProps {
  destination: Destination
  onSwipe: (direction: "left" | "right") => void
}

export function DestinationCard({ destination, onSwipe }: DestinationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  const rightIndicatorOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1])
  const leftIndicatorOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right")
    } else if (info.offset.x < -100) {
      onSwipe("left")
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <div className="relative h-[400px]">
        <img
          src={destination.imageUrl || "/placeholder.svg"}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Like/Dislike Indicators */}
        <motion.div
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-xl"
          style={{ opacity: rightIndicatorOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-xl"
          style={{ opacity: leftIndicatorOpacity }}
        >
          NOPE
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold">{destination.name}</h2>
          <p className="text-lg">{destination.country}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {destination.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 text-white">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 rounded-full p-2"
          aria-label={expanded ? "Hide details" : "Show details"}
        >
          <Info className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {expanded && (
        <div className="p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <p className="mb-3">{destination.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-semibold">Best time to visit:</p>
              <p>{destination.bestTimeToVisit}</p>
            </div>
            <div>
              <p className="font-semibold">Average daily cost:</p>
              <p>${destination.averagePrice}/day</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold">Flight time:</p>
              <p>{destination.flightTime}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

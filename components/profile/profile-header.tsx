"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Check, MapPin, Calendar } from "lucide-react"

interface User {
  id: string
  name: string
  email: string | null
  avatar: string
  location: string
  joinedDate: string
  bio: string
}

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(user.bio)

  const handleSaveBio = () => {
    // In a real app, we would save this to the database
    setIsEditingBio(false)
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <CardContent className="relative pt-0">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-12">
          <div className="relative rounded-full border-4 border-white overflow-hidden h-32 w-32 bg-white">
            <Image
              src="/placeholder.svg?key=egsyy"
              alt="La Sagrada Familia, Barcelona"
              width={128}
              height={128}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1 pt-4 md:pt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>
              <Button variant="outline" className="mt-2 md:mt-0">
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">About</h2>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              {isEditingBio ? <Check size={18} /> : <Pencil size={18} />}
            </button>
          </div>

          {isEditingBio ? (
            <div className="mt-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleSaveBio}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{bio}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

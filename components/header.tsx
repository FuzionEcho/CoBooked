"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, Phone, Mail, Sun, Moon } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Update the useSupabase hook usage to handle null supabase client
  const { supabase, isSupabaseReady } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user)
        }
      })
    }
  }, [supabase, isSupabaseReady])

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
      window.location.href = "/"
    }
  }

  // Define base navigation items
  const baseNavItems = [
    { name: "Home", path: "/" },
    { name: "Flights", path: "/flights" },
    { name: "Join Trip", path: "/join-trip" }, // Updated to link to the new join-trip page
    { name: "Car Hire", path: "/car-hire" },
  ]

  // Add Profile button with conditional path based on authentication status
  // Update to direct to /signup when not logged in
  const navItems = [
    ...baseNavItems,
    {
      name: "Profile",
      path: user ? "/profile" : "/signup", // If logged in, go to profile page, else go to signup
    },
  ]

  return (
    <header className="w-full bg-transparent">
      <div className="bg-mediumblue dark:bg-gray-900 text-white py-2">
        <div className="container mx-auto flex justify-end items-center gap-6 px-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm">+1 234-567-8910</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">info@cobooked.com</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Image
                src="/cobooked-logo.png"
                alt="CoBooked Logo"
                width={40}
                height={40}
                className="brightness-0 invert" // This makes the black logo appear white
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">COBOOKED</span>
              <span className="text-xs text-blue-300/70">Plan Your Adventure</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === item.path ? "text-white" : "text-blue-200"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-darkblue dark:text-blue-200"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trips">My Trips</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="bg-mediumblue hover:bg-mediumblue/90 dark:bg-gray-900 dark:hover:bg-gray-800 text-white"
              asChild
            >
              <Link href="/login">Contact Us</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 bg-white dark:bg-gray-900">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="bg-mediumblue hover:bg-mediumblue/90 dark:bg-gray-900 dark:hover:bg-gray-800 text-white"
                asChild
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Contact Us
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

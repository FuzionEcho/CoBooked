import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full py-4 bg-transparent">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <Image
              src="/cobooked-logo.png"
              alt="CoBooked Logo"
              width={24}
              height={24}
              className="dark:invert" // Invert in dark mode for visibility
            />
          </div>
          <p className="text-sm text-darkblue/70 dark:text-blue-200/70">© 2023 CoBooked. All rights reserved.</p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-sm font-medium text-darkblue/70 dark:text-blue-200/70 hover:text-mediumblue dark:hover:text-blue-300"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-darkblue/70 dark:text-blue-200/70 hover:text-mediumblue dark:hover:text-blue-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-darkblue/70 dark:text-blue-200/70 hover:text-mediumblue dark:hover:text-blue-300"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoBooked",
  description: "Collaborative travel planning for friends around the world",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
              <video
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20video%20-%20Made%20with%20Clipchamp-qmuuJeThhqV5JsUzpStVxawAbK0H4d.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-darkblue/10 backdrop-blur-[2px]"></div>
            </div>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8">
                {/* Reduced width from max-w-6xl to max-w-5xl and added more margin */}
                <div className="w-full max-w-5xl my-12 mx-auto bg-white dark:bg-gray-900 dark:text-gray-100 rounded-xl shadow-xl overflow-hidden">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20video%20-%20Made%20with%20Clipchamp-qmuuJeThhqV5JsUzpStVxawAbK0H4d.mp4"
            type="video/mp4"
          />
        </video>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50"></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-start space-y-8 max-w-3xl">
          <div className="ml-8">
            <p className="text-mediumblue font-medium mb-2">Let's get this trip out of the group chat.</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-darkblue">
              <span className="text-[rgb(17,22,34)] dark:text-white">CONVENIENT & COLLABORATIVE</span>
              <span className="text-mediumblue dark:text-white block">TRAVEL PLANNING!</span>
            </h1>
          </div>

          <p className="text-darkblue/80 text-lg max-w-2xl ml-8 dark:text-gray-300">
            Enjoy a hassle-free travel planning experience with modern tools, collaborative features, and smart
            recommendations. Fresh, simple solutions—made for friends planning trips together!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 ml-8">
            <Button size="lg" className="bg-mediumblue hover:bg-mediumblue/90 text-white px-8 py-6 text-lg" asChild>
              <Link href="/flights">Search Flights</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-mediumblue text-mediumblue hover:bg-mediumblue/10 px-8 py-6 text-lg"
              asChild
            >
              <Link href="/match-game">Find Destination</Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-8 ml-8">
            <div className="flex -space-x-2">
              <img src="/diverse-group.png" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
              <img
                src="/diverse-woman-portrait.png"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <img src="/thoughtful-man.png" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
              <img src="/young-woman-smiling.png" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="font-medium ml-1">4.9+</span>
                <span className="text-darkblue/70 dark:text-gray-300 ml-1">Rating</span>
              </div>
              <div className="text-sm text-darkblue/70 dark:text-gray-400">1200+ Reviews</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12 relative z-10">
        <a
          href="#features"
          className="scroll-down flex flex-col items-center text-darkblue/70 hover:text-mediumblue dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </div>
    </section>
  )
}

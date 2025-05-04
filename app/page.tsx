import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { HowItWorksSection } from "@/components/how-it-works-section"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
    </div>
  )
}

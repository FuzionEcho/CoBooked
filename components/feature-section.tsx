import { Globe, Users, ThumbsUp, MapPin, CreditCard, Calendar } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-mediumblue" />,
      title: "Group Trip Rooms",
      description:
        "Create a shared planning space where friends can join via link or code to collaborate on trip planning.",
    },
    {
      icon: <Globe className="h-10 w-10 text-mediumblue" />,
      title: "Smart Destination Suggestions",
      description:
        "Get personalized destination recommendations based on everyone's location, budget, and preferences.",
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-mediumblue" />,
      title: "Real-Time Voting",
      description: "Vote on destinations and see live results to make decisions together as a group.",
    },
    {
      icon: <MapPin className="h-10 w-10 text-mediumblue" />,
      title: "Destination Previews",
      description: "Explore potential destinations with image galleries, weather info, and local tips.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-mediumblue" />,
      title: "Budget Friendly",
      description:
        "Compare flight costs and accommodation options to find destinations that work for everyone's budget.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-mediumblue" />,
      title: "Trip Summary",
      description: "Get a shareable trip summary with all the details once you've made your final decision.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-16 border-t" id="features">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter text-darkblue sm:text-4xl">
              Features That Make Trip Planning Easy
            </h2>
            <p className="text-darkblue/70 md:text-lg">
              TripMate simplifies the process of planning a group trip with friends from different locations.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-start space-y-3 p-6 bg-white/50 dark:bg-[rgb(50,51,61)] rounded-lg shadow-sm dark:border dark:border-gray-700/30"
            >
              <div className="p-2 rounded-full bg-lightblue/10">{feature.icon}</div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-darkblue">{feature.title}</h3>
                <p className="text-darkblue/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

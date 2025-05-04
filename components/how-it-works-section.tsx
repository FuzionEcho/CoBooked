export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create a Trip Room",
      description: "Start by creating a trip room and inviting your friends to join using a unique code or link.",
    },
    {
      number: "02",
      title: "Add Your Preferences",
      description:
        "Everyone adds their location, budget, travel dates, and interests to help find the perfect destination.",
    },
    {
      number: "03",
      title: "Explore Suggestions",
      description: "TripMate analyzes everyone's input and suggests destinations that work for the whole group.",
    },
    {
      number: "04",
      title: "Vote and Decide",
      description: "Vote on your favorite destinations and see real-time results to make a group decision.",
    },
    {
      number: "05",
      title: "Plan Your Trip",
      description: "Once you've chosen a destination, get a shareable trip summary with all the details.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-16 border-t" id="how-it-works">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter text-darkblue sm:text-4xl">How It Works</h2>
            <p className="text-darkblue/70 md:text-lg">
              Planning a trip with friends has never been easier. Follow these simple steps to get started.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:gap-12 md:grid-cols-2 lg:gap-16">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lightblue text-white font-bold">
                {step.number}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-darkblue">{step.title}</h3>
                <p className="text-darkblue/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

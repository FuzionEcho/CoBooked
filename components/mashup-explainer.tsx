import { AlertTriangle, ExternalLink, Info, ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MashupExplainer() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          About Mashup Flights
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Understanding Mashup Flights</DialogTitle>
          <DialogDescription>
            Mashups can offer cheaper options but come with additional considerations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p>
            Mashups are flight options created by connecting flights from airlines that don't have formal agreements
            with each other. They can offer cost savings or route options that wouldn't otherwise be available, but they
            come with some important considerations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    SOOW
                  </Badge>
                  Sum of One-Way
                </CardTitle>
                <CardDescription>Different airlines for outbound and return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Example:</span> Flying from London to New York with British Airways,
                    and returning with Virgin Atlantic.
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">What it means:</span> You'll make separate bookings for your outbound
                    and return flights with different airlines.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md mt-2 text-sm">
                    <div className="flex gap-2 items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p>
                        If one airline has issues (like strikes or cancellations), the other airline won't accommodate
                        you or offer compensation for your other flight.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">NPST</Badge>
                  Non-Protected Self-Transfer
                </CardTitle>
                <CardDescription>Different airlines for connecting flights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Example:</span> Flying from London to Sydney with Emirates to Dubai,
                    then Qantas from Dubai to Sydney.
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">What it means:</span> You'll make separate bookings for each segment
                    and must collect and re-check your baggage at the connection point.
                  </p>
                  <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md mt-2 text-sm">
                    <div className="flex gap-2 items-start">
                      <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p>
                        If you miss your connection due to delays, you'll need to buy a new ticket for the next segment.
                        Allow plenty of time between flights.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Important Tips for Booking Mashups</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <span className="font-medium">Check all availability first:</span> Open all booking links before
                purchasing any tickets to ensure all flights are available.
              </li>
              <li>
                <span className="font-medium">Allow extra connection time:</span> For NPST mashups, leave plenty of time
                between flights to collect baggage, clear customs, and check in again.
              </li>
              <li>
                <span className="font-medium">Consider travel insurance:</span> Purchase comprehensive travel insurance
                that covers missed connections and cancellations.
              </li>
              <li>
                <span className="font-medium">Save all booking references:</span> Keep all booking confirmations and
                references easily accessible during your journey.
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <a
                href="https://www.skyscanner.net/about-us/product-features/mashups"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Learn more about Mashups
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

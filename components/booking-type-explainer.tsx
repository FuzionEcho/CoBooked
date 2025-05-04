import { AlertTriangle, ExternalLink, Info, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export enum TransferType {
  UNSPECIFIED = "TRANSFER_TYPE_UNSPECIFIED",
  MANAGED = "TRANSFER_TYPE_MANAGED",
  SELF_TRANSFER = "TRANSFER_TYPE_SELF_TRANSFER",
  PROTECTED_SELF_TRANSFER = "TRANSFER_TYPE_PROTECTED_SELF_TRANSFER",
}

export enum MashupType {
  NONE = "NONE",
  SUM_OF_ONE_WAY = "SUM_OF_ONE_WAY",
  NON_PROTECTED_SELF_TRANSFER = "NON_PROTECTED_SELF_TRANSFER",
}

export function BookingTypeExplainer() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          About Flight Booking Types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Understanding Flight Booking Types</DialogTitle>
          <DialogDescription>
            Different booking types offer varying levels of protection and convenience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="standard" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="standard">Standard Bookings</TabsTrigger>
            <TabsTrigger value="ota">OTA Virtual Interlines</TabsTrigger>
            <TabsTrigger value="mashup">Mashups</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Standard (Managed) Bookings</h3>
            </div>

            <p>
              Standard bookings are the most common and secure type of flight booking. They're managed by a single agent
              or airline and provide full protection for your entire journey.
            </p>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-green-500">Protected Transfer</Badge>
                </CardTitle>
                <CardDescription>Full protection for your entire journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">What it means:</span> If you have connecting flights, the airline or
                    agent will take full responsibility for getting you to your destination if something goes wrong.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Single booking reference for your entire journey</li>
                    <li>Automatic baggage transfer between connecting flights</li>
                    <li>If you miss a connection due to a delay, the airline will rebook you at no extra cost</li>
                    <li>Customer service from a single provider for your entire journey</li>
                  </ul>
                  <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md mt-2 text-sm">
                    <div className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p>
                        This is the most secure and convenient booking type, especially recommended for travelers who
                        value peace of mind or have tight connections.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ota" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-medium">OTA Virtual Interlines</h3>
            </div>

            <p>
              OTA Virtual Interlines are self-transfer flights booked through an Online Travel Agency (OTA) that offer
              some level of protection, but require you to handle your own baggage at connections.
            </p>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="text-amber-500 border-amber-500">
                    Protected Self-Transfer
                  </Badge>
                </CardTitle>
                <CardDescription>Some protection, but requires self-transfer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">What it means:</span> The OTA provides some protection if things go
                    wrong, but you'll need to handle your own baggage at connection points.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Single booking through the OTA, but may involve multiple airlines</li>
                    <li>
                      <strong>You must collect and re-check your baggage</strong> at connection points
                    </li>
                    <li>
                      If flights are delayed or canceled, contact the OTA (not the airlines) for assistance with
                      rebooking
                    </li>
                    <li>Different OTAs offer different levels of protection and assistance</li>
                  </ul>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md mt-2 text-sm">
                    <div className="flex gap-2 items-start">
                      <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Important:</strong> If anything goes wrong, contact the OTA immediately. The airlines
                        themselves won't help with rebooking as they don't have a commercial agreement with each other.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Tips for OTA Virtual Interlines</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-medium">Allow extra time between flights:</span> Since you need to collect and
                  re-check baggage, ensure you have enough connection time.
                </li>
                <li>
                  <span className="font-medium">Check the OTA's protection policy:</span> Different OTAs offer different
                  levels of protection - understand what yours covers.
                </li>
                <li>
                  <span className="font-medium">Save the OTA's contact information:</span> If something goes wrong,
                  you'll need to contact them directly, not the airlines.
                </li>
                <li>
                  <span className="font-medium">Consider travel insurance:</span> For additional protection, especially
                  for international connections.
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="mashup" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium">Mashup Flights</h3>
            </div>

            <p>
              Mashups are flight options created by connecting flights from airlines that don't have formal agreements
              with each other. They can offer cost savings but come with significant risks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="warning">SOOW</Badge>
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
                      <span className="font-medium">What it means:</span> You'll make separate bookings for your
                      outbound and return flights with different airlines.
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
                          If you miss your connection due to delays, you'll need to buy a new ticket for the next
                          segment. Allow plenty of time between flights.
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
                  <span className="font-medium">Allow extra connection time:</span> For NPST mashups, leave plenty of
                  time between flights to collect baggage, clear customs, and check in again.
                </li>
                <li>
                  <span className="font-medium">Consider travel insurance:</span> Purchase comprehensive travel
                  insurance that covers missed connections and cancellations.
                </li>
                <li>
                  <span className="font-medium">Save all booking references:</span> Keep all booking confirmations and
                  references easily accessible during your journey.
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button variant="outline" asChild>
            <a
              href="https://www.skyscanner.net/about-us/product-features"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Learn more about flight booking types
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

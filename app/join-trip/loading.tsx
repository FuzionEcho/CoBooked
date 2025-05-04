import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function JoinTripLoading() {
  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>

          <Tabs defaultValue="code" className="animate-pulse">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code" disabled>
                Enter Code
              </TabsTrigger>
              <TabsTrigger value="scan" disabled>
                Scan QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="scan">
              <CardContent className="space-y-4 pt-6">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-lg" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

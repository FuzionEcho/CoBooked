import { Skeleton } from "@/components/ui/skeleton"

export default function FlightsLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-1/3 mb-6" />
      <Skeleton className="h-5 w-full max-w-2xl mb-8" />

      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full rounded-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

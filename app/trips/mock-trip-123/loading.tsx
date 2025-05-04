import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      {/* Trip Header Skeleton */}
      <div className="relative h-64 rounded-lg overflow-hidden mb-6">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-6">
        <Skeleton className="h-10 w-full mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

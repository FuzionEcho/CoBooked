import { Skeleton } from "@/components/ui/skeleton"

export default function CarHireLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-10 w-64 mb-6" />

      <Skeleton className="h-24 w-full mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[500px] w-full" />
        <div className="lg:col-span-2">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    </div>
  )
}

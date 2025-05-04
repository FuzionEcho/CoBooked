import { Shield } from "lucide-react"

export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Shield className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2">Loading Admin Dashboard</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
}

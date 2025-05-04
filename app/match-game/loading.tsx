export default function MatchGameLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-10 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Loading Destination Match Game...</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}

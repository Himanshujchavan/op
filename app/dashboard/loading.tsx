import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-primary font-medium">Loading dashboard...</p>
      </div>
    </div>
  )
}

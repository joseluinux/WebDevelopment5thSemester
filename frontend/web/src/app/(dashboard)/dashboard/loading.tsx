import { StatCardSkeleton } from "@/app/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-surface-container-highest rounded-lg mb-2" />
        <div className="h-4 w-64 bg-surface-container-high rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + widget */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-72 bg-surface-container rounded-xl" />
        <div className="lg:col-span-2 h-72 bg-surface-container rounded-xl" />
      </div>

      {/* Recent transactions skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface-container rounded-xl px-6 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-surface-container-high rounded" />
              <div className="h-3 w-1/5 bg-surface-container-high rounded" />
            </div>
            <div className="h-5 w-20 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

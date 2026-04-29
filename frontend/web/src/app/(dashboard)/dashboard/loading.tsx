import { StatCardSkeleton, TableRowSkeleton } from "@/app/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-obsidian-elevated rounded-lg mb-2" />
        <div className="h-4 w-64 bg-obsidian-elevated rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + widget */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-72 bg-obsidian-card rounded-card border border-obsidian-elevated" />
        <div className="lg:col-span-2 h-72 bg-obsidian-card rounded-card border border-obsidian-elevated" />
      </div>

      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

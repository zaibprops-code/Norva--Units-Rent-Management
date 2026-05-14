import { AlertCardSkeleton, Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card px-4 py-3">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div>
        <Skeleton className="mb-3 h-4 w-36" />
        <AlertCardSkeleton />
      </div>
    </div>
  );
}

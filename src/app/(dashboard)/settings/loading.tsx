import { Skeleton } from "@/components/ui";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>

      <div className="card divide-y divide-gray-100 overflow-hidden">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        ))}
      </div>

      <div className="card p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

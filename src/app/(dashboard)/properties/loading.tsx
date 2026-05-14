import { Skeleton, TableRowSkeleton } from "@/components/ui";

export default function PropertiesLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {["Property", "Address", "Units", "Occupancy", "Health"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

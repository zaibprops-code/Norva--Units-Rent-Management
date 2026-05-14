import { Skeleton, TableRowSkeleton } from "@/components/ui";

export default function TenantsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {["Tenant", "Unit", "Property", "Rent", "Lease end", "TRS"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    <Skeleton className="h-3 w-14" />
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <TableRowSkeleton key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

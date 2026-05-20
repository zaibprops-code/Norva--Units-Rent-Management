import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Building2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getOrgId } from "@/lib/utils/server-helpers";
import { Button, EmptyState, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Badge } from "@/components/ui";
import { formatAddress } from "@/lib/utils";
import { ROUTES } from "@/constants";

export const metadata: Metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgId = await getOrgId(user.id);
  if (!orgId) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select("*, units(id, status)")
    .eq("org_id", orgId)
    .order("name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Properties</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {properties?.length ?? 0} properties in your portfolio
          </p>
        </div>
        <Link href={ROUTES.PROPERTY_NEW}>
          <Button variant="primary" size="sm"><Plus size={14} />Add property</Button>
        </Link>
      </div>

      {!properties?.length ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No properties yet"
          description="Add your first property to start monitoring your portfolio."
          action={{ label: "Add property", onClick: () => {} }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableHeadCell>Property</TableHeadCell>
            <TableHeadCell>Address</TableHeadCell>
            <TableHeadCell>Units</TableHeadCell>
            <TableHeadCell>Occupancy</TableHeadCell>
            <TableHeadCell>Health</TableHeadCell>
          </TableHead>
          <TableBody>
            {properties.map((property) => {
              const units = property.units ?? [];
              const occupied = units.filter((u: { status: string }) => u.status === "occupied").length;
              const total = units.length;
              const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
              return (
                <TableRow key={property.id} onClick={() => {}}>
                  <TableCell>
                    <Link href={`/dashboard/properties/${property.id}`} className="font-medium text-gray-900 hover:text-teal-700">
                      {property.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatAddress(property.address, property.city, property.state, property.zip)}
                  </TableCell>
                  <TableCell>{total}</TableCell>
                  <TableCell>
                    <span className={pct >= 90 ? "text-green-700 font-medium" : pct >= 70 ? "text-amber-700 font-medium" : "text-red-700 font-medium"}>
                      {pct}%
                    </span>
                    <span className="ml-1 text-xs text-gray-400">({occupied}/{total})</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.health_score >= 80 ? "green" : property.health_score >= 60 ? "amber" : "red"}>
                      {property.health_score}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

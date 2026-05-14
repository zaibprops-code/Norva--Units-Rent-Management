// =============================================================================
// TENANTS LIST PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge, Button, EmptyState, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui";
import { formatTenantName, formatTRSLabel, getTRSColor } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenants" };

export default async function TenantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const { data: tenants } = await supabase
    .from("tenants")
    .select("*, units(unit_number, property_id, properties(name)), leases(status, rent_amount, lease_end)")
    .eq("org_id", org.id)
    .order("last_name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Tenants</h1>
          <p className="mt-0.5 text-sm text-gray-500">{tenants?.length ?? 0} tenants</p>
        </div>
        <Link href="/dashboard/tenants/new">
          <Button variant="primary" size="sm">
            <Plus size={14} /> Add tenant
          </Button>
        </Link>
      </div>

      {!tenants?.length ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No tenants yet"
          description="Add tenants to start tracking rent and communications."
        />
      ) : (
        <Table>
          <TableHead>
            <TableHeadCell>Tenant</TableHeadCell>
            <TableHeadCell>Unit</TableHeadCell>
            <TableHeadCell>Property</TableHeadCell>
            <TableHeadCell>Rent</TableHeadCell>
            <TableHeadCell>Lease end</TableHeadCell>
            <TableHeadCell>TRS</TableHeadCell>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => {
              const unit = Array.isArray(tenant.units) ? tenant.units[0] : tenant.units;
              const property = unit?.properties && (Array.isArray(unit.properties) ? unit.properties[0] : unit.properties);
              const lease = Array.isArray(tenant.leases)
                ? tenant.leases.find((l: { status: string }) => l.status === "active")
                : null;
              const trsColorClass = getTRSColor(tenant.trs_score);

              return (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={tenant.first_name} lastName={tenant.last_name} size="sm" />
                      <Link
                        href={`/dashboard/tenants/${tenant.id}`}
                        className="font-medium text-gray-900 hover:text-teal-700"
                      >
                        {formatTenantName(tenant.first_name, tenant.last_name)}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{unit?.unit_number ?? "—"}</TableCell>
                  <TableCell className="text-gray-500">{property?.name ?? "—"}</TableCell>
                  <TableCell>
                    {lease ? (
                      <span className="font-medium text-gray-900">${lease.rent_amount}/mo</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {lease?.lease_end ? new Date(lease.lease_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${trsColorClass}`}>
                      {tenant.trs_score} · {formatTRSLabel(tenant.trs_score)}
                    </span>
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

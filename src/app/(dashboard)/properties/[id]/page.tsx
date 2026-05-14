// =============================================================================
// PROPERTY DETAIL PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui";
import { formatAddress, formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Property" };

interface Props { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .single();

  if (!property) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("*, leases(*, tenants(id, first_name, last_name, trs_score))")
    .eq("property_id", id)
    .order("unit_number");

  const { data: activeAlerts } = await supabase
    .from("alerts")
    .select("id, type, urgency, title, created_at")
    .eq("property_id", id)
    .eq("status", "active")
    .order("urgency", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/properties" className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Properties
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{property.name}</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {formatAddress(property.address, property.city, property.state, property.zip)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={property.health_score >= 80 ? "green" : property.health_score >= 60 ? "amber" : "red"}>
              Health {property.health_score}
            </Badge>
            <Button variant="primary" size="sm">
              <Plus size={14} /> Add unit
            </Button>
          </div>
        </div>
      </div>

      {/* Active alerts */}
      {activeAlerts && activeAlerts.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Active alerts</h2>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{alert.title}</span>
                <Badge variant={alert.urgency >= 80 ? "red" : alert.urgency >= 60 ? "amber" : "blue"}>
                  {alert.urgency}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Units table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Units ({units?.length ?? 0})</h2>
        <Table>
          <TableHead>
            <TableHeadCell>Unit</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Tenant</TableHeadCell>
            <TableHeadCell>Rent</TableHeadCell>
            <TableHeadCell>TRS</TableHeadCell>
          </TableHead>
          <TableBody>
            {units?.map((unit) => {
              const lease = Array.isArray(unit.leases) ? unit.leases.find((l: { status: string }) => l.status === "active") : null;
              const tenant = lease?.tenants;
              return (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.unit_number}</TableCell>
                  <TableCell>
                    <Badge variant={unit.status === "occupied" ? "green" : unit.status === "vacant" ? "gray" : "amber"}>
                      {unit.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tenant ? (
                      <Link href={`/dashboard/tenants/${tenant.id}`} className="text-teal-700 hover:underline">
                        {tenant.first_name} {tenant.last_name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lease ? formatCurrency(lease.rent_amount) : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell>
                    {tenant ? (
                      <Badge variant={tenant.trs_score >= 80 ? "green" : tenant.trs_score >= 60 ? "blue" : "amber"}>
                        {tenant.trs_score}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

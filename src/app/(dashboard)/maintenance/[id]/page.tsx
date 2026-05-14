// =============================================================================
// MAINTENANCE TICKET DETAIL PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { formatDate, formatRelative, formatTenantName } from "@/lib/utils";

export const metadata: Metadata = { title: "Ticket" };
interface Props { params: Promise<{ id: string }> }

const URGENCY_VARIANT: Record<string, "red" | "amber" | "blue" | "gray"> = {
  emergency: "red", urgent: "amber", standard: "blue", low: "gray",
};

export default async function MaintenanceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const { data: ticket } = await supabase
    .from("maintenance_tickets")
    .select("*, properties(name, address), units(unit_number), tenants(id, first_name, last_name, email, phone)")
    .eq("id", id).eq("org_id", org.id).single();
  if (!ticket) notFound();

  const property = Array.isArray(ticket.properties) ? ticket.properties[0] : ticket.properties;
  const unit = Array.isArray(ticket.units) ? ticket.units[0] : ticket.units;
  const tenant = Array.isArray(ticket.tenants) ? ticket.tenants[0] : ticket.tenants;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/maintenance" className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Maintenance
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-lg font-semibold text-gray-900">{ticket.title}</h1>
          <div className="flex gap-2">
            <Badge variant={URGENCY_VARIANT[ticket.urgency] ?? "gray"}>{ticket.urgency}</Badge>
            <Badge variant={ticket.status === "resolved" ? "green" : ticket.status === "open" ? "red" : "amber"}>
              {ticket.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {property?.name}{unit ? ` · ${unit.unit_number}` : ""} · Reported {formatRelative(ticket.created_at)}
        </p>
      </div>

      <div className="card p-5 space-y-4">
        {ticket.description && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Description</h3>
            <p className="text-sm leading-relaxed text-gray-700">{ticket.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reported by</p>
            {tenant ? (
              <Link href={`/dashboard/tenants/${tenant.id}`} className="mt-1 block font-medium text-teal-700 hover:underline">
                {formatTenantName(tenant.first_name, tenant.last_name)}
              </Link>
            ) : <p className="mt-1 text-gray-400">—</p>}
            {tenant?.phone && <p className="text-gray-500">{tenant.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
            <p className="mt-1 text-gray-700 capitalize">{ticket.category ?? "Other"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned to</p>
            <p className="mt-1 text-gray-700">{ticket.assigned_to ?? "Unassigned"}</p>
            {ticket.assigned_phone && <p className="text-gray-500">{ticket.assigned_phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scheduled</p>
            <p className="mt-1 text-gray-700">{ticket.scheduled_date ? formatDate(ticket.scheduled_date) : "Not scheduled"}</p>
          </div>
        </div>

        {ticket.resolved_at && (
          <div className="rounded-lg bg-green-50 px-3 py-2.5">
            <p className="text-sm text-green-700">
              <span className="font-medium">Resolved</span> {formatDate(ticket.resolved_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

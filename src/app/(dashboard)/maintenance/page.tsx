// =============================================================================
// MAINTENANCE LIST PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Wrench } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge, Button, EmptyState, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "@/components/ui";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Maintenance" };

const STATUS_VARIANT: Record<string, "gray" | "amber" | "blue" | "green" | "red"> = {
  open: "red",
  acknowledged: "amber",
  assigned: "blue",
  in_progress: "blue",
  resolved: "green",
  closed: "gray",
};

const URGENCY_VARIANT: Record<string, "red" | "amber" | "blue" | "gray"> = {
  emergency: "red",
  urgent: "amber",
  standard: "blue",
  low: "gray",
};

export default async function MaintenancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const { data: tickets } = await supabase
    .from("maintenance_tickets")
    .select("*, properties(name), units(unit_number), tenants(first_name, last_name)")
    .eq("org_id", org.id)
    .order("urgency_score", { ascending: false })
    .order("created_at", { ascending: false });

  const open = tickets?.filter((t) => !["resolved", "closed"].includes(t.status)) ?? [];
  const resolved = tickets?.filter((t) => ["resolved", "closed"].includes(t.status)) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Maintenance</h1>
          <p className="mt-0.5 text-sm text-gray-500">{open.length} open · {resolved.length} resolved</p>
        </div>
        <Link href="/dashboard/maintenance/new">
          <Button variant="primary" size="sm"><Plus size={14} /> Log ticket</Button>
        </Link>
      </div>

      {!tickets?.length ? (
        <EmptyState
          icon={<Wrench size={22} />}
          title="No maintenance tickets"
          description="Tickets submitted by tenants or logged manually will appear here."
        />
      ) : (
        <>
          {open.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Open ({open.length})</h2>
              <Table>
                <TableHead>
                  <TableHeadCell>Issue</TableHeadCell>
                  <TableHeadCell>Unit</TableHeadCell>
                  <TableHeadCell>Urgency</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Reported</TableHeadCell>
                  <TableHeadCell>Assigned to</TableHeadCell>
                </TableHead>
                <TableBody>
                  {open.map((ticket) => {
                    const property = Array.isArray(ticket.properties) ? ticket.properties[0] : ticket.properties;
                    const unit = Array.isArray(ticket.units) ? ticket.units[0] : ticket.units;
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Link href={`/dashboard/maintenance/${ticket.id}`} className="font-medium text-gray-900 hover:text-teal-700">
                            {ticket.title}
                          </Link>
                          {property && <p className="text-xs text-gray-400">{property.name}</p>}
                        </TableCell>
                        <TableCell className="text-gray-500">{unit?.unit_number ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={URGENCY_VARIANT[ticket.urgency] ?? "gray"}>{ticket.urgency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[ticket.status] ?? "gray"}>{ticket.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">{formatRelative(ticket.created_at)}</TableCell>
                        <TableCell className="text-gray-500">{ticket.assigned_to ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Resolved ({resolved.length})</h2>
              <Table>
                <TableHead>
                  <TableHeadCell>Issue</TableHeadCell>
                  <TableHeadCell>Unit</TableHeadCell>
                  <TableHeadCell>Resolved</TableHeadCell>
                </TableHead>
                <TableBody>
                  {resolved.slice(0, 10).map((ticket) => {
                    const unit = Array.isArray(ticket.units) ? ticket.units[0] : ticket.units;
                    return (
                      <TableRow key={ticket.id} className="opacity-60">
                        <TableCell>
                          <Link href={`/dashboard/maintenance/${ticket.id}`} className="font-medium text-gray-700 hover:text-teal-700">
                            {ticket.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-gray-500">{unit?.unit_number ?? "—"}</TableCell>
                        <TableCell className="text-xs text-gray-400">{ticket.resolved_at ? formatRelative(ticket.resolved_at) : "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

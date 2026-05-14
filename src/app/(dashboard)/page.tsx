// =============================================================================
// DASHBOARD HOME — Operations Feed
// The main view. Server component loads initial data.
// Client component subscribes to realtime updates.
// =============================================================================
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OperationsFeed } from "@/components/dashboard/OperationsFeed";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Operations Feed",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get org
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, plan")
    .eq("owner_id", user.id)
    .single();

  if (!org) redirect("/login");

  // Load active alerts (urgency DESC — most urgent first)
  const { data: alerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      properties:property_id (id, name),
      units:unit_id (id, unit_number),
      tenants:tenant_id (id, first_name, last_name, email, phone, trs_score)
    `
    )
    .eq("org_id", org.id)
    .eq("status", "active")
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  // Load recently resolved alerts (last 24h)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: resolvedAlerts } = await supabase
    .from("alerts")
    .select(
      `
      *,
      properties:property_id (id, name),
      units:unit_id (id, unit_number),
      tenants:tenant_id (id, first_name, last_name, email, phone, trs_score)
    `
    )
    .eq("org_id", org.id)
    .eq("status", "resolved")
    .gte("resolved_at", yesterday)
    .order("resolved_at", { ascending: false })
    .limit(10);

  // Portfolio stats
  const { data: units } = await supabase
    .from("units")
    .select("id, status")
    .eq("org_id", org.id);

  const { data: openTickets } = await supabase
    .from("maintenance_tickets")
    .select("id, urgency")
    .eq("org_id", org.id)
    .in("status", ["open", "acknowledged", "assigned", "in_progress"]);

  const totalUnits = units?.length ?? 0;
  const occupiedUnits = units?.filter((u) => u.status === "occupied").length ?? 0;
  const activeAlerts = alerts?.length ?? 0;
  const criticalAlerts = alerts?.filter((a) => a.urgency >= 80).length ?? 0;

  const stats = {
    totalUnits,
    occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    activeAlerts,
    criticalAlerts,
    overdueCount: alerts?.filter((a) => a.type === "overdue_rent").length ?? 0,
    openMaintenanceCount: openTickets?.length ?? 0,
    healthScore: Math.max(
      0,
      100 - criticalAlerts * 15 - activeAlerts * 3
    ),
  };

  return (
    <div className="space-y-6">
      {/* Portfolio stats bar */}
      <PortfolioStats stats={stats} />

      {/* Operations feed */}
      <OperationsFeed
        orgId={org.id}
        initialAlerts={alerts ?? []}
        resolvedAlerts={resolvedAlerts ?? []}
      />
    </div>
  );
}

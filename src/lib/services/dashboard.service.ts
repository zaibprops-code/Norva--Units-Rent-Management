// =============================================================================
// DASHBOARD SERVICE — aggregated portfolio stats
// Single function that fetches everything the dashboard needs in parallel.
// Called from the dashboard Server Component.
// =============================================================================
import { createClient } from "@/lib/supabase/server";
import type { PortfolioStats } from "@/types";

export async function getPortfolioStats(
  orgId: string
): Promise<PortfolioStats> {
  const supabase = await createClient();

  const [unitsResult, alertsResult, maintenanceResult] = await Promise.all([
    supabase
      .from("units")
      .select("id, status")
      .eq("org_id", orgId),

    supabase
      .from("alerts")
      .select("id, type, urgency")
      .eq("org_id", orgId)
      .eq("status", "active"),

    supabase
      .from("maintenance_tickets")
      .select("id, urgency")
      .eq("org_id", orgId)
      .in("status", ["open", "acknowledged", "assigned", "in_progress"]),
  ]);

  const units = unitsResult.data ?? [];
  const alerts = alertsResult.data ?? [];
  const maintenance = maintenanceResult.data ?? [];

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === "occupied").length;
  const vacantUnits = units.filter((u) => u.status === "vacant").length;
  const activeAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.urgency >= 80).length;
  const overdueCount = alerts.filter(
    (a) => a.type === "overdue_rent"
  ).length;

  // Health score: starts at 100, deducted by critical and non-critical alerts
  const healthScore = Math.max(
    0,
    100 - criticalAlerts * 15 - (activeAlerts - criticalAlerts) * 3
  );

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate:
      totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    activeAlerts,
    criticalAlerts,
    overdueCount,
    openMaintenanceCount: maintenance.length,
    healthScore,
  };
}

export async function getRecentActivity(orgId: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

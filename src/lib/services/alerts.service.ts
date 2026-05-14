// =============================================================================
// ALERTS SERVICE — server-side data access
// Use in Server Components and Server Actions only.
// Never import in Client Components.
// =============================================================================
import { createClient } from "@/lib/supabase/server";

export interface AlertWithRelations {
  id: string;
  org_id: string;
  type: string;
  status: string;
  urgency: number;
  title: string;
  body: string | null;
  recommended_action: string | null;
  escalation_level: number;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
  properties: { id: string; name: string } | null;
  units: { id: string; unit_number: string } | null;
  tenants: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    trs_score: number;
  } | null;
}

const ALERT_WITH_RELATIONS = `
  *,
  properties:property_id(id, name),
  units:unit_id(id, unit_number),
  tenants:tenant_id(id, first_name, last_name, email, phone, trs_score)
` as const;

export async function getActiveAlerts(
  orgId: string,
  limit = 50
): Promise<AlertWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select(ALERT_WITH_RELATIONS)
    .eq("org_id", orgId)
    .eq("status", "active")
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[alerts.service] getActiveAlerts:", error.message);
    return [];
  }
  return (data ?? []) as AlertWithRelations[];
}

export async function getRecentlyResolvedAlerts(
  orgId: string,
  hours = 24
): Promise<AlertWithRelations[]> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - hours * 60 * 60 * 1000
  ).toISOString();

  const { data } = await supabase
    .from("alerts")
    .select(ALERT_WITH_RELATIONS)
    .eq("org_id", orgId)
    .eq("status", "resolved")
    .gte("resolved_at", since)
    .order("resolved_at", { ascending: false })
    .limit(10);

  return (data ?? []) as AlertWithRelations[];
}

export async function getAlertById(
  alertId: string,
  orgId: string
): Promise<AlertWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("alerts")
    .select(ALERT_WITH_RELATIONS)
    .eq("id", alertId)
    .eq("org_id", orgId)
    .single();

  return data as AlertWithRelations | null;
}

export async function getAlertCountByStatus(
  orgId: string
): Promise<{ active: number; critical: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("alerts")
    .select("id, urgency")
    .eq("org_id", orgId)
    .eq("status", "active");

  const all = data ?? [];
  return {
    active: all.length,
    critical: all.filter((a) => a.urgency >= 80).length,
  };
}

// =============================================================================
// CRON: LEASE SCANNER — POST /api/cron/lease-scanner
// Called daily at 6:00 AM via Vercel Cron.
// Finds leases expiring within 90 days and creates alerts.
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/server";
import { calculateLeaseExpiryUrgency } from "@/lib/utils/urgency";
import { LEASE_EXPIRY } from "@/constants";

export const maxDuration = 30;

function verifySecret(request: NextRequest): boolean {
  return request.headers.get("authorization") === `Bearer ${process.env.APP_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const scanUntil = new Date(now.getTime() + LEASE_EXPIRY.ANALYSIS_TRIGGER_DAYS * 86400000);
  const scanUntilStr = scanUntil.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  const { data: leases, error } = await supabase
    .from("leases")
    .select(`
      id, org_id, unit_id, tenant_id, lease_end, rent_amount,
      tenants(first_name, last_name),
      units(unit_number, property_id)
    `)
    .eq("status", "active")
    .lte("lease_end", scanUntilStr)
    .gte("lease_end", todayStr);

  if (error) {
    console.error("[CRON_LEASE_SCANNER] Error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let created = 0;
  let updated = 0;

  for (const lease of leases ?? []) {
    const tenant = Array.isArray(lease.tenants) ? lease.tenants[0] : lease.tenants;
    const unit = Array.isArray(lease.units) ? lease.units[0] : lease.units;
    if (!tenant || !unit) continue;

    const daysUntil = Math.ceil(
      (new Date(lease.lease_end).getTime() - now.getTime()) / 86400000
    );
    const urgency = calculateLeaseExpiryUrgency(daysUntil);

    const title = `Lease expiring — ${tenant.first_name} ${tenant.last_name} · ${unit.unit_number}`;
    const body = `Lease ends ${lease.lease_end} (${daysUntil} days). Consider initiating renewal conversation.`;
    const recommendedAction = daysUntil <= LEASE_EXPIRY.URGENT_DAYS
      ? "Lease expiring imminently — take immediate action on renewal or move-out."
      : daysUntil <= LEASE_EXPIRY.REMINDER_DAYS
      ? "Send renewal offer or confirm non-renewal with tenant."
      : "Review tenant history and decide whether to offer renewal.";

    const { data: existing } = await supabase
      .from("alerts")
      .select("id")
      .eq("org_id", lease.org_id)
      .eq("lease_id", lease.id)
      .eq("type", "lease_expiring")
      .eq("status", "active")
      .single();

    if (existing) {
      await supabase
        .from("alerts")
        .update({ urgency, body, recommended_action: recommendedAction, metadata: { days_until: daysUntil, lease_end: lease.lease_end } })
        .eq("id", existing.id);
      updated++;
    } else {
      await supabase.from("alerts").insert({
        org_id: lease.org_id,
        unit_id: lease.unit_id,
        tenant_id: lease.tenant_id,
        lease_id: lease.id,
        property_id: unit.property_id,
        type: "lease_expiring",
        status: "active",
        urgency,
        title,
        body,
        recommended_action: recommendedAction,
        escalation_level: 0,
        metadata: { days_until: daysUntil, lease_end: lease.lease_end },
      });
      created++;
    }
  }

  return NextResponse.json({ scanned: leases?.length ?? 0, created, updated });
}

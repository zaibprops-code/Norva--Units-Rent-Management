// =============================================================================
// CRON: RENT CHECK — POST /api/cron/rent-check
// Called daily at 7:00 AM via Vercel Cron (vercel.json).
// Finds overdue leases and creates/escalates alerts.
// No AI — pure rule-based logic.
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/server";
import { calculateRentUrgency } from "@/lib/utils/urgency";
import { RENT_ESCALATION } from "@/constants";
import type { Database } from "@/types/database";

type AlertUpdatePayload = Database["public"]["Tables"]["alerts"]["Update"];
type AlertInsertPayload = Database["public"]["Tables"]["alerts"]["Insert"];
type PaymentInsertPayload = Database["public"]["Tables"]["payments"]["Insert"];
type ActivityLogInsertPayload = Database["public"]["Tables"]["activity_log"]["Insert"];

export const maxDuration = 60;

function verifySecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.APP_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const { data: leases, error } = await supabase
    .from("leases")
    .select(`
      id, org_id, unit_id, tenant_id, rent_amount, rent_due_day,
      grace_period_days, late_fee_type, late_fee_amount,
      tenants(id, first_name, last_name, email, trs_score),
      units(id, unit_number, property_id)
    `)
    .eq("status", "active");

  if (error) {
    console.error("[CRON_RENT_CHECK] Leases query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let processed = 0;
  let alertsCreated = 0;
  let alertsEscalated = 0;

  for (const lease of leases ?? []) {
    const dueDate = new Date(now.getFullYear(), now.getMonth(), lease.rent_due_day);
    if (dueDate > now) continue;

    const dueDateStr = dueDate.toISOString().split("T")[0];

    const { data: payment } = await supabase
      .from("payments")
      .select("id, status, paid_date")
      .eq("lease_id", lease.id)
      .eq("due_date", dueDateStr)
      .single();

    if (payment?.status === "paid") continue;

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / msPerDay);
    const daysOverdue = Math.max(0, daysPastDue - lease.grace_period_days);

    if (daysOverdue === 0 && daysPastDue <= lease.grace_period_days) continue;

    const tenant = Array.isArray(lease.tenants) ? lease.tenants[0] : lease.tenants;
    const unit = Array.isArray(lease.units) ? lease.units[0] : lease.units;
    if (!tenant || !unit) continue;

    const { count: missedCount } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", lease.tenant_id)
      .in("status", ["failed", "pending"])
      .lt("due_date", dueDateStr);

    const trsScore = (tenant as { trs_score?: number }).trs_score ?? 75;
    const previousMisses = missedCount ?? 0;

    const urgencyScore = calculateRentUrgency({
      daysOverdue,
      previousMissedPayments: previousMisses,
      trsScore,
      gracePeriodDays: lease.grace_period_days,
    });

    let escalationLevel = 0;
    if (daysOverdue >= RENT_ESCALATION.LEVEL_3_DAYS) escalationLevel = 3;
    else if (daysOverdue >= RENT_ESCALATION.LEVEL_2_DAYS) escalationLevel = 2;
    else if (daysOverdue >= RENT_ESCALATION.LEVEL_1_DAYS) escalationLevel = 1;

    const unitNumber = (unit as { unit_number?: string }).unit_number ?? "";
    const propertyId = (unit as { property_id?: string }).property_id ?? null;
    const tenantFirst = (tenant as { first_name?: string }).first_name ?? "";
    const tenantLast = (tenant as { last_name?: string }).last_name ?? "";

    const title = `⚠️ Overdue rent — ${tenantFirst} ${tenantLast} · ${unitNumber}`;
    const body = `Rent of $${lease.rent_amount} is ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue. ` +
      `Tenant TRS: ${trsScore}. Previous misses: ${previousMisses}. ` +
      (escalationLevel >= 2 ? "Formal notice recommended." : "Reminder sequence active.");

    const recommendedAction = escalationLevel >= 3
      ? "Approve formal demand notice before Norva sends it."
      : escalationLevel >= 2
      ? "Review and send formal late notice to tenant."
      : "Automated reminder sequence is running. Monitor for response.";

    const { data: existingAlert } = await supabase
      .from("alerts")
      .select("id, escalation_level")
      .eq("org_id", lease.org_id)
      .eq("lease_id", lease.id)
      .eq("type", "overdue_rent")
      .eq("status", "active")
      .single();

    // existingAlert.id and escalation_level typed via explicit cast
    const existing = existingAlert as { id: string; escalation_level: number } | null;

    if (existing) {
      if (escalationLevel > existing.escalation_level) {
        const updatePayload: AlertUpdatePayload = {
          urgency: urgencyScore,
          body,
          recommended_action: recommendedAction,
          escalation_level: escalationLevel,
          metadata: { days_overdue: daysOverdue, amount: lease.rent_amount, escalation_level: escalationLevel },
        };
        await supabase
          .from("alerts")
          .update(updatePayload as never)
          .eq("id", existing.id);
        alertsEscalated++;
      }
    } else {
      if (!payment) {
        const paymentPayload: PaymentInsertPayload = {
          org_id: lease.org_id,
          lease_id: lease.id,
          tenant_id: lease.tenant_id,
          amount: lease.rent_amount,
          due_date: dueDateStr,
          status: "pending",
        };
        await supabase.from("payments").insert(paymentPayload as never);
      }

      const alertPayload: AlertInsertPayload = {
        org_id: lease.org_id,
        unit_id: lease.unit_id,
        tenant_id: lease.tenant_id,
        lease_id: lease.id,
        property_id: propertyId,
        type: "overdue_rent",
        status: "active",
        urgency: urgencyScore,
        title,
        body,
        recommended_action: recommendedAction,
        escalation_level: escalationLevel,
        metadata: { days_overdue: daysOverdue, amount: lease.rent_amount, escalation_level: escalationLevel },
      };
      await supabase.from("alerts").insert(alertPayload as never);
      alertsCreated++;
    }

    const logPayload: ActivityLogInsertPayload = {
      org_id: lease.org_id,
      entity_type: "alert",
      entity_id: lease.id,
      action: existing ? "escalated" : "created",
      actor: "norva",
      metadata: { days_overdue: daysOverdue, urgency: urgencyScore },
    };
    await supabase.from("activity_log").insert(logPayload as never);

    processed++;
  }

  console.log(`[CRON_RENT_CHECK] Done. Processed: ${processed}, Created: ${alertsCreated}, Escalated: ${alertsEscalated}`);
  return NextResponse.json({ processed, alertsCreated, alertsEscalated });
}

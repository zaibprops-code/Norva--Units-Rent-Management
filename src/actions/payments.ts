"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Explicit payload types — bypass the SDK's generic inference chain.
type PaymentUpdatePayload =
  Database["public"]["Tables"]["payments"]["Update"];

type AlertUpdatePayload =
  Database["public"]["Tables"]["alerts"]["Update"];

type ActivityLogInsertPayload =
  Database["public"]["Tables"]["activity_log"]["Insert"];

// Explicit pick for the payment lookup query result.
type PaymentPick = {
  id: string;
  org_id: string;
  lease_id: string;
  tenant_id: string;
};

// ---------------------------------------------------------------------------
// Private helper: get org ID with explicit return type.
// ---------------------------------------------------------------------------
async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

// ---------------------------------------------------------------------------
// Public Server Action
// ---------------------------------------------------------------------------
export async function markPaymentPaidAction(
  paymentId: string,
  paidDate: string,
  method = "manual",
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const orgId = await getOrgId(user.id);
  if (!orgId) return { success: false, error: "Organization not found" };

  // Verify the payment belongs to this org.
  const { data: paymentRaw } = await supabase
    .from("payments")
    .select("id, org_id, lease_id, tenant_id")
    .eq("id", paymentId)
    .eq("org_id", orgId)
    .single();

  const payment = paymentRaw as PaymentPick | null;
  if (!payment) return { success: false, error: "Payment not found" };

  // Mark the payment as paid — explicit payload type annotation.
  const paymentPayload: PaymentUpdatePayload = {
    status: "paid",
    paid_date: paidDate,
    payment_method: method as
      | "manual"
      | "cash"
      | "check"
      | "venmo"
      | "zelle"
      | "stripe",
    notes: notes ?? null,
  };

  const { error } = await supabase
    .from("payments")
    .update(paymentPayload as never)
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  // Auto-resolve any active overdue_rent alert for this lease.
  const alertPayload: AlertUpdatePayload = {
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolved_by: user.id,
    resolution_note: "Payment received — auto-resolved by Norva",
  };

  await supabase
    .from("alerts")
    .update(alertPayload as never)
    .eq("org_id", orgId)
    .eq("lease_id", payment.lease_id)
    .eq("type", "overdue_rent")
    .eq("status", "active");

  // Log the action.
  const logPayload: ActivityLogInsertPayload = {
    org_id: orgId,
    entity_type: "payment",
    entity_id: paymentId,
    action: "payment_received",
    actor: user.id,
    metadata: { paid_date: paidDate, method },
  };

  await supabase.from("activity_log").insert(logPayload as never);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tenants/${payment.tenant_id}`);
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Private helper — explicit return type bypasses SDK column-inference issues.
// Returns the org ID string for the current user, or null if not found.
// Using an explicit Promise<string | null> annotation means TypeScript accepts
// the return value regardless of what it infers from .select("id").single().
// ---------------------------------------------------------------------------
async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .single();
  // data?.id ?? null: even if 'data' infers as never, 'never ?? null' = null,
  // which satisfies the string | null return type.
  return (data as { id: string } | null)?.id ?? null;
}

// ---------------------------------------------------------------------------
// Pick type for the payment verification query.
// Explicit type annotation prevents "Property 'x' does not exist on type 'never'"
// when the SDK cannot fully infer the column-filtered select result.
// ---------------------------------------------------------------------------
type PaymentPick = {
  id: string;
  org_id: string;
  lease_id: string;
  tenant_id: string;
};

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

  // Use explicit-return-type helper — avoids inference failure on org query.
  const orgId = await getOrgId(user.id);
  if (!orgId) return { success: false, error: "Organization not found" };

  // Verify the payment belongs to this org.
  // Cast to PaymentPick | null so all subsequent property accesses are typed.
  const { data: paymentRaw } = await supabase
    .from("payments")
    .select("id, org_id, lease_id, tenant_id")
    .eq("id", paymentId)
    .eq("org_id", orgId)
    .single();

  const payment = paymentRaw as PaymentPick | null;
  if (!payment) return { success: false, error: "Payment not found" };

  // Mark the payment as paid.
  const { error } = await supabase
    .from("payments")
    .update({
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
    })
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  // Auto-resolve any active overdue_rent alert for this lease.
  await supabase
    .from("alerts")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_note: "Payment received — auto-resolved by Norva",
    })
    .eq("org_id", orgId)
    .eq("lease_id", payment.lease_id)
    .eq("type", "overdue_rent")
    .eq("status", "active");

  // Log the action.
  await supabase.from("activity_log").insert({
    org_id: orgId,
    entity_type: "payment",
    entity_id: paymentId,
    action: "payment_received",
    actor: user.id,
    metadata: { paid_date: paidDate, method },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/tenants/${payment.tenant_id}`);
  return { success: true };
}

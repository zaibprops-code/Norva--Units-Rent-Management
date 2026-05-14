"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!org) return { success: false, error: "Organization not found" };

  // Verify the payment belongs to this org
  const { data: payment } = await supabase
    .from("payments")
    .select("id, org_id, lease_id, tenant_id")
    .eq("id", paymentId)
    .eq("org_id", org.id)
    .single();
  if (!payment) return { success: false, error: "Payment not found" };

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

  // Auto-resolve any active overdue_rent alert for this lease
  await supabase
    .from("alerts")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_note: "Payment received — auto-resolved by Norva",
    })
    .eq("org_id", org.id)
    .eq("lease_id", payment.lease_id)
    .eq("type", "overdue_rent")
    .eq("status", "active");

  await supabase.from("activity_log").insert({
    org_id: org.id,
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

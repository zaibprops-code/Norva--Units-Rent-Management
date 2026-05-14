// =============================================================================
// PAYMENTS SERVICE — server-side data access
// =============================================================================
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { InsertPayment, Payment } from "@/types";

export async function getPaymentsByLease(leaseId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("lease_id", leaseId)
    .order("due_date", { ascending: false });
  return data ?? [];
}

export async function getPaymentsByTenant(
  tenantId: string,
  limit = 12
): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("due_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function markPaymentPaid(
  paymentId: string,
  paidDate: string,
  method: string,
  notes?: string
): Promise<{ data: Payment | null; error: Error | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      paid_date: paidDate,
      payment_method: method as Payment["payment_method"],
      notes: notes ?? null,
    })
    .eq("id", paymentId)
    .select()
    .single();

  return {
    data: data as Payment | null,
    error: error ? new Error(error.message) : null,
  };
}

export async function createPendingPayment(
  payment: InsertPayment
): Promise<{ data: Payment | null; error: Error | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single();
  return {
    data: data as Payment | null,
    error: error ? new Error(error.message) : null,
  };
}

export async function getOverduePaymentCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "pending")
    .lt("due_date", today);
  return count ?? 0;
}

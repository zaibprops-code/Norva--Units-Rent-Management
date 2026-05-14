// =============================================================================
// TENANTS SERVICE — server-side data access
// =============================================================================
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/types";

export async function getTenantsByOrg(orgId: string): Promise<Tenant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select(
      `*,
       units:unit_id(unit_number, property_id,
         properties:property_id(name)
       ),
       leases(status, rent_amount, lease_start, lease_end)`
    )
    .eq("org_id", orgId)
    .order("last_name");
  return (data ?? []) as Tenant[];
}

export async function getTenantById(
  tenantId: string,
  orgId: string
): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select(
      `*,
       units:unit_id(unit_number, property_id,
         properties:property_id(name, address)
       )`
    )
    .eq("id", tenantId)
    .eq("org_id", orgId)
    .single();
  return data as Tenant | null;
}

export async function updateTenantTRS(
  tenantId: string,
  orgId: string,
  trsScore: number
): Promise<{ error: Error | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      trs_score: Math.max(0, Math.min(100, trsScore)),
      trs_last_updated: new Date().toISOString(),
    })
    .eq("id", tenantId)
    .eq("org_id", orgId);
  return { error: error ? new Error(error.message) : null };
}

export async function getTenantCount(orgId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("tenants")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId);
  return count ?? 0;
}

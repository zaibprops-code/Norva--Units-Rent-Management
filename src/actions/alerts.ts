"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const organizationsTable = supabase.from("organizations") as any;

  const { data } = await organizationsTable
    .select("id")
    .eq("owner_id", userId)
    .single();

  return data?.id ?? null;
}

export async function resolveAlertAction(
  alertId: string,
  resolutionNote = "Resolved by landlord"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const orgId = await getOrgId(user.id);

  if (!orgId) {
    return { success: false, error: "Organization not found" };
  }

  const alertsTable = supabase.from("alerts") as any;

  const { error } = await alertsTable
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_note: resolutionNote,
    })
    .eq("id", alertId)
    .eq("org_id", orgId);

  if (error) {
    return { success: false, error: error.message };
  }

  const activityLogTable = supabase.from("activity_log") as any;

  await activityLogTable.insert({
    org_id: orgId,
    entity_type: "alert",
    entity_id: alertId,
    action: "resolved",
    actor: user.id,
    metadata: {
      resolution_note: resolutionNote,
    },
  });

  revalidatePath("/dashboard");

  return { success: true };
}

export async function dismissAlertAction(
  alertId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const orgId = await getOrgId(user.id);

  if (!orgId) {
    return { success: false, error: "Organization not found" };
  }

  const alertsTable = supabase.from("alerts") as any;

  const { error } = await alertsTable
    .update({
      status: "dismissed",
    })
    .eq("id", alertId)
    .eq("org_id", orgId);

  if (error) {
    return { success: false, error: error.message };
  }

  const activityLogTable = supabase.from("activity_log") as any;

  await activityLogTable.insert({
    org_id: orgId,
    entity_type: "alert",
    entity_id: alertId,
    action: "dismissed",
    actor: user.id,
    metadata: {},
  });

  revalidatePath("/dashboard");

  return { success: true };
}

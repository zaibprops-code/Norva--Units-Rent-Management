"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .single();

  return (data as { id: string } | null)?.id ?? null;
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

  const { error } = await supabase
    .from("alerts")
    .update(
      {
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        resolution_note: resolutionNote,
      } as any
    )
    .eq("id", alertId)
    .eq("org_id", orgId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("activity_log").insert(
    {
      org_id: orgId,
      entity_type: "alert",
      entity_id: alertId,
      action: "resolved",
      actor: user.id,
      metadata: {
        resolution_note: resolutionNote,
      },
    } as any
  );

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

  const { error } = await supabase
    .from("alerts")
    .update(
      {
        status: "dismissed",
      } as any
    )
    .eq("id", alertId)
    .eq("org_id", orgId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("activity_log").insert(
    {
      org_id: orgId,
      entity_type: "alert",
      entity_id: alertId,
      action: "dismissed",
      actor: user.id,
      metadata: {},
    } as any
  );

  revalidatePath("/dashboard");

  return { success: true };
}

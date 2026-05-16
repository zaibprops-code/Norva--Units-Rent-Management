"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// Explicit payload types derived directly from our Database definition.
// We use these instead of relying on the SDK's generic inference chain,
// which can fail to resolve in certain build environments when the full
// Database generic hasn't been fully evaluated yet.
type AlertUpdatePayload =
  Database["public"]["Tables"]["alerts"]["Update"];

type ActivityLogInsertPayload =
  Database["public"]["Tables"]["activity_log"]["Insert"];

// ---------------------------------------------------------------------------
// Private helper: get org ID for the current user.
// Explicit return type avoids inference failure on .select("id").single().
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
// Private helper: execute an alert update with an explicitly typed payload.
// Isolating the .update() call with a known payload type means TypeScript
// validates the shape against AlertUpdatePayload, not through the SDK chain.
// ---------------------------------------------------------------------------
async function updateAlert(
  alertId: string,
  orgId: string,
  payload: AlertUpdatePayload
): Promise<{ error: { message: string } | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("alerts")
    .update(payload as never) // narrowed cast: payload IS AlertUpdatePayload, SDK just can't prove it
    .eq("id", alertId)
    .eq("org_id", orgId);
  return { error };
}

// ---------------------------------------------------------------------------
// Private helper: insert an activity log entry.
// ---------------------------------------------------------------------------
async function logActivity(
  payload: ActivityLogInsertPayload
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("activity_log").insert(payload as never);
}

// ---------------------------------------------------------------------------
// Public Server Actions
// ---------------------------------------------------------------------------

export async function resolveAlertAction(
  alertId: string,
  resolutionNote = "Resolved by landlord"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const orgId = await getOrgId(user.id);
  if (!orgId) return { success: false, error: "Organization not found" };

  const payload: AlertUpdatePayload = {
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolved_by: user.id,
    resolution_note: resolutionNote,
  };

  const { error } = await updateAlert(alertId, orgId, payload);
  if (error) return { success: false, error: error.message };

  await logActivity({
    org_id: orgId,
    entity_type: "alert",
    entity_id: alertId,
    action: "resolved",
    actor: user.id,
    metadata: { resolution_note: resolutionNote },
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
  if (!user) return { success: false, error: "Not authenticated" };

  const orgId = await getOrgId(user.id);
  if (!orgId) return { success: false, error: "Organization not found" };

  const payload: AlertUpdatePayload = {
    status: "dismissed",
  };

  const { error } = await updateAlert(alertId, orgId, payload);
  if (error) return { success: false, error: error.message };

  await logActivity({
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

// =============================================================================
// SERVER-ONLY HELPERS
// Utilities for Server Components, Route Handlers, and Server Actions.
// Import path: "@/lib/utils/server-helpers"
//
// DO NOT import in Client Components — this file imports from
// @/lib/supabase/server which requires next/headers (server-only).
// =============================================================================
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types";

// ---------------------------------------------------------------------------
// getOrgId
// Returns the org ID string for the current authenticated user, or null.
// Explicit return type bypasses Supabase SDK column-inference failures on
// .select("id").single() which can infer data as `never` in some builds.
// ---------------------------------------------------------------------------
export async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

// ---------------------------------------------------------------------------
// getOrg
// Returns the full Organization row for the current user, or null.
// Uses .select("*") which infers the full Row type — lower inference risk
// than column-narrowed selects, but still cast for build stability.
// ---------------------------------------------------------------------------
export async function getOrg(userId: string): Promise<Organization | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", userId)
    .single();
  return (data as Organization | null) ?? null;
}

// =============================================================================
// AUTH GUARD UTILITIES
// Server-side helpers for protecting API routes and Server Actions.
// Never import createClient from here on the client side.
// =============================================================================
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types";

export interface AuthContext {
  userId: string;
  orgId: string;
  organization: Organization;
}

/**
 * Require an authenticated user + organization.
 * Redirects to /login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (orgError || !org) redirect("/login");

  return {
    userId: user.id,
    orgId: org.id,
    organization: org as Organization,
  };
}

/**
 * Return the current user + org without redirecting.
 * Returns null if not authenticated — caller decides what to do.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!org) return null;

    return { userId: user.id, orgId: org.id, organization: org as Organization };
  } catch {
    return null;
  }
}

/**
 * Verify APP_SECRET for cron and internal API routes.
 * Usage: if (!verifyCronSecret(request.headers.get("authorization"))) return unauthorized();
 */
export function verifyCronSecret(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const secret = process.env.APP_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

/**
 * Verify that a given orgId belongs to the current authenticated user.
 * Use in API routes that accept orgId from the request body to prevent
 * cross-org data access.
 */
export async function verifyOrgOwnership(
  orgId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .eq("owner_id", userId)
    .single();
  return !!data;
}

// =============================================================================
// DASHBOARD LAYOUT
// Applied to all authenticated dashboard pages.
// Contains the sidebar navigation and top bar.
// =============================================================================
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Norva",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get organization for this user
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  // New user with no org — shouldn't happen due to trigger, but handle gracefully
  if (!organization) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell user={user} organization={organization}>
      {children}
    </DashboardShell>
  );
}

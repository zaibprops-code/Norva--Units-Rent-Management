// =============================================================================
// NOTIFICATIONS SETTINGS PAGE
// =============================================================================
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { NotificationSettingsForm } from "@/components/settings/NotificationSettingsForm";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <Link href="/dashboard/settings" className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Settings
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
        <p className="mt-0.5 text-sm text-gray-500">Control how and when Norva contacts you.</p>
      </div>
      <NotificationSettingsForm org={org} userEmail={user.email ?? ""} />
    </div>
  );
}

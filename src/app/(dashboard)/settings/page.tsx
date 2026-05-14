// =============================================================================
// SETTINGS PAGE
// =============================================================================
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Bell, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("*").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const settingsLinks = [
    {
      href: "/dashboard/settings/billing",
      icon: CreditCard,
      label: "Billing & plan",
      description: `Currently on ${org.plan} plan`,
    },
    {
      href: "/dashboard/settings/notifications",
      icon: Bell,
      label: "Notifications",
      description: "Configure digest timing and alert preferences",
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">{org.name}</p>
      </div>

      <div className="card divide-y divide-gray-100 overflow-hidden">
        {settingsLinks.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Icon size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Account info */}
      <div className="card p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Organization</span>
            <span className="font-medium text-gray-900">{org.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Timezone</span>
            <span className="font-medium text-gray-900">{org.timezone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

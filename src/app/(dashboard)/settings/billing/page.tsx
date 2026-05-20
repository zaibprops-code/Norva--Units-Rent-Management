import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getOrg } from "@/lib/utils/server-helpers";
import { Badge, Button } from "@/components/ui";
import { PLANS } from "@/lib/utils/plans";
import type { PlanId } from "@/types";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const org = await getOrg(user.id);
  if (!org) redirect("/login");

  const currentPlan = PLANS[org.plan as PlanId];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/settings" className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Settings
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Billing & plan</h1>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current plan</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{currentPlan.name}</p>
            <p className="text-sm text-gray-500">${currentPlan.priceMonthly}/month</p>
          </div>
          <Badge variant={org.lemon_subscription_status === "active" ? "green" : "amber"}>
            {org.lemon_subscription_status ?? "Active"}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Unit limit</p>
            <p className="font-semibold text-gray-900">{currentPlan.features.unitLimit} units</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Users</p>
            <p className="font-semibold text-gray-900">{currentPlan.features.userLimit} user{currentPlan.features.unitLimit > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Available plans</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = plan.id === org.plan;
            const features = [
              `${plan.features.unitLimit} units`,
              plan.features.tenantSms && "Tenant SMS",
              plan.features.leaseRenewalAnalysis && "Renewal analysis",
              plan.features.trsScoring && "TRS scoring",
              plan.features.apiAccess && "API access",
            ].filter(Boolean);

            return (
              <div key={plan.id} className={`card p-4 ${isCurrent ? "ring-2 ring-teal-500 ring-offset-1" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{plan.name}</p>
                  {isCurrent && <Badge variant="teal">Current</Badge>}
                </div>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  ${plan.priceMonthly}<span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {features.map((f) => (
                    <li key={String(f)} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button variant="secondary" size="sm" className="mt-3 w-full">Upgrade</Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Billing managed by Lemon Squeezy. To cancel, contact{" "}
        <a href="mailto:support@norva.io" className="underline hover:text-gray-600">support@norva.io</a>
      </p>
    </div>
  );
}

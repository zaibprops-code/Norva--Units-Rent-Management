// =============================================================================
// TENANT DETAIL PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Avatar, Badge } from "@/components/ui";
import { formatTenantName, formatCurrency, formatDate, getTRSColor, formatTRSLabel, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Tenant" };
interface Props { params: Promise<{ id: string }> }

export default async function TenantDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
  if (!org) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, units(unit_number, properties(name))")
    .eq("id", id).eq("org_id", org.id).single();
  if (!tenant) notFound();

  const { data: leases } = await supabase
    .from("leases")
    .select("*")
    .eq("tenant_id", id)
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("tenant_id", id)
    .order("due_date", { ascending: false })
    .limit(12);

  const { data: communications } = await supabase
    .from("communications")
    .select("*")
    .eq("tenant_id", id)
    .order("sent_at", { ascending: false })
    .limit(20);

  const activeLease = leases?.find((l) => l.status === "active");
  const unit = Array.isArray(tenant.units) ? tenant.units[0] : tenant.units;
  const property = unit?.properties && (Array.isArray(unit.properties) ? unit.properties[0] : unit.properties);

  const trsColor = getTRSColor(tenant.trs_score);
  const onTimePayments = payments?.filter((p) => p.status === "paid" && (!p.paid_date || new Date(p.paid_date) <= new Date(new Date(p.due_date).getTime() + 5 * 86400000))).length ?? 0;
  const totalPayments = payments?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/tenants" className="mb-2 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={14} /> Tenants
        </Link>
        <div className="flex items-start gap-4">
          <Avatar firstName={tenant.first_name} lastName={tenant.last_name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {formatTenantName(tenant.first_name, tenant.last_name)}
              </h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${trsColor}`}>
                TRS {tenant.trs_score} · {formatTRSLabel(tenant.trs_score)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
              {property && <span>{property.name}{unit ? ` · ${unit.unit_number}` : ""}</span>}
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 hover:text-gray-800">
                  <Mail size={13} /> {tenant.email}
                </a>
              )}
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-gray-800">
                  <Phone size={13} /> {tenant.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Stats */}
        <div className="space-y-3">
          <div className="card p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Lease</h2>
            {activeLease ? (
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Rent</span><span className="font-semibold">{formatCurrency(activeLease.rent_amount)}/mo</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Start</span><span>{formatDate(activeLease.lease_start)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">End</span><span>{formatDate(activeLease.lease_end)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Due day</span><span>Day {activeLease.rent_due_day}</span></div>
              </div>
            ) : <p className="text-sm text-gray-400">No active lease</p>}
          </div>
          <div className="card p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Payment record</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">On time</span><span className="font-semibold text-green-700">{onTimePayments}/{totalPayments}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tenancy</span><span>{activeLease ? formatDate(activeLease.lease_start) : "—"}</span></div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent payments</h2>
          {payments?.length ? (
            <div className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-400">Due {formatDate(payment.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.status === "paid" ? "green" : payment.status === "failed" ? "red" : payment.status === "partial" ? "amber" : "gray"}>
                      {payment.status}
                    </Badge>
                    {payment.paid_date && (
                      <p className="mt-0.5 text-xs text-gray-400">Paid {formatDate(payment.paid_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No payment history</p>}
        </div>
      </div>

      {/* Communication timeline */}
      <div className="card p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Communication timeline</h2>
        {communications?.length ? (
          <div className="divide-y divide-gray-100">
            {communications.map((comm) => (
              <div key={comm.id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={comm.direction === "outbound" ? "blue" : "teal"} size="sm">
                      {comm.direction === "outbound" ? "Sent" : "Received"}
                    </Badge>
                    <Badge variant="gray" size="sm">{comm.channel}</Badge>
                    {comm.subject && <span className="font-medium text-gray-800">{comm.subject}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{formatRelative(comm.sent_at)}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{comm.body}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400">No communications yet</p>}
      </div>
    </div>
  );
}

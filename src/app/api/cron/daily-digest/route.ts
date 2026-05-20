// =============================================================================
// CRON: DAILY DIGEST — POST /api/cron/daily-digest
// Called daily at 6:30 AM via Vercel Cron.
// Generates and sends a morning digest email to each org owner.
// Uses simple template at MVP — AI narrative added later.
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { EMAIL } from "@/constants";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

function verifySecret(request: NextRequest): boolean {
  return request.headers.get("authorization") === `Bearer ${process.env.APP_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get all orgs
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, notification_email, owner_id")
    .not("notification_email", "is", null);

  let sent = 0;

  type OrgRow = { id: string; name: string; notification_email: string | null; owner_id: string };
  for (const org of (orgs ?? []) as OrgRow[]) {
    try {
      const recipientEmail = org.notification_email;
      if (!recipientEmail) continue;

      // Active alerts
      const { data: activeAlerts } = await supabase
        .from("alerts")
        .select("id, type, urgency, title")
        .eq("org_id", org.id)
        .eq("status", "active")
        .order("urgency", { ascending: false })
        .limit(10);

      // Resolved in last 24h
      const { data: resolvedToday } = await supabase
        .from("alerts")
        .select("id, type, title, resolved_at")
        .eq("org_id", org.id)
        .eq("status", "resolved")
        .gte("resolved_at", yesterday);

      // Open maintenance
      const { data: openMaintenance } = await supabase
        .from("maintenance_tickets")
        .select("id, title, urgency")
        .eq("org_id", org.id)
        .in("status", ["open", "acknowledged", "assigned", "in_progress"])
        .order("urgency_score", { ascending: false })
        .limit(5);

      const critical = activeAlerts?.filter((a) => a.urgency >= 80) ?? [];
      const high = activeAlerts?.filter((a) => a.urgency >= 60 && a.urgency < 80) ?? [];
      const pendingDecisions = critical.length + high.length;
      const allClear = (activeAlerts?.length ?? 0) === 0;

      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
      const today = formatDate(new Date());

      const htmlBody = buildDigestHtml({
        orgName: org.name,
        today,
        allClear,
        activeAlerts: activeAlerts ?? [],
        resolvedToday: resolvedToday ?? [],
        openMaintenance: openMaintenance ?? [],
        pendingDecisions,
        critical,
        dashboardUrl,
      });

      await resend.emails.send({
        from: `${EMAIL.FROM_NAME} <${EMAIL.FROM_ADDRESS}>`,
        to: recipientEmail,
        reply_to: EMAIL.REPLY_TO,
        subject: allClear
          ? `✅ Norva Digest — ${today}: All clear`
          : `⚠️ Norva Digest — ${today}: ${pendingDecisions} item${pendingDecisions === 1 ? "" : "s"} need attention`,
        html: htmlBody,
      });

      // Log digest sent
      await supabase.from("digest_log").insert(({
        org_id: org.id,
        actions_taken: resolvedToday?.length ?? 0,
        pending_decisions: pendingDecisions,
        alerts_resolved: resolvedToday?.length ?? 0,
        content: {
          active_count: activeAlerts?.length ?? 0,
          resolved_count: resolvedToday?.length ?? 0,
          maintenance_count: openMaintenance?.length ?? 0,
        },
      }) as never);

      sent++;
    } catch (err) {
      console.error(`[DIGEST] Failed for org ${org.id}:`, err);
    }
  }

  return NextResponse.json({ sent });
}

function buildDigestHtml({
  orgName, today, allClear, activeAlerts, resolvedToday,
  openMaintenance, pendingDecisions, critical, dashboardUrl,
}: {
  orgName: string;
  today: string;
  allClear: boolean;
  activeAlerts: Array<{ id: string; type: string; urgency: number; title: string }>;
  resolvedToday: Array<{ id: string; type: string; title: string; resolved_at: string | null }>;
  openMaintenance: Array<{ id: string; title: string; urgency: string }>;
  pendingDecisions: number;
  critical: Array<{ id: string; type: string; urgency: number; title: string }>;
  dashboardUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Norva Daily Digest</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:#0d1b2a;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:#00c2a8;font-size:18px;">◭</span>
        <span style="color:#ffffff;font-weight:600;font-size:15px;letter-spacing:.04em;">Norva</span>
      </div>
      <span style="color:#627d98;font-size:12px;">${today}</span>
    </div>

    <!-- Body -->
    <div style="padding:24px;">
      <p style="margin:0 0 4px;color:#374151;font-size:13px;">Good morning,</p>
      <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">${orgName} portfolio update.</p>

      ${allClear ? `
      <!-- All clear -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">✅ All clear — no active alerts</p>
        <p style="margin:4px 0 0;color:#16a34a;font-size:13px;">Norva is monitoring your portfolio. No action needed today.</p>
      </div>
      ` : `
      <!-- Pending decisions -->
      ${pendingDecisions > 0 ? `
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:16px;">
        <p style="margin:0 0 2px;color:#92400e;font-size:13px;font-weight:600;">${pendingDecisions} item${pendingDecisions === 1 ? "" : "s"} need your attention</p>
        <a href="${dashboardUrl}" style="color:#0d1b2a;font-size:12px;font-weight:500;">Review in Norva →</a>
      </div>
      ` : ""}

      <!-- Critical alerts -->
      ${critical.length > 0 ? `
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Critical</p>
      <div style="margin-bottom:16px;">
        ${critical.map((a) => `
        <div style="border-left:3px solid #ef4444;padding:10px 12px;background:#fef2f2;border-radius:0 6px 6px 0;margin-bottom:6px;">
          <p style="margin:0;font-size:13px;font-weight:500;color:#111827;">${a.title}</p>
        </div>`).join("")}
      </div>
      ` : ""}

      <!-- Other active -->
      ${activeAlerts.filter(a => a.urgency < 80).length > 0 ? `
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Active alerts</p>
      <div style="margin-bottom:16px;">
        ${activeAlerts.filter(a => a.urgency < 80).map((a) => `
        <div style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:4px;">
          <p style="margin:0;font-size:12px;color:#374151;">${a.title}</p>
        </div>`).join("")}
      </div>
      ` : ""}
      `}

      <!-- Resolved today -->
      ${resolvedToday.length > 0 ? `
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Handled by Norva (last 24h)</p>
      <div style="margin-bottom:16px;">
        ${resolvedToday.map((a) => `
        <div style="padding:8px 12px;background:#f9fafb;border-radius:6px;margin-bottom:4px;">
          <p style="margin:0;font-size:12px;color:#6b7280;">✓ ${a.title}</p>
        </div>`).join("")}
      </div>
      ` : ""}

      <!-- Open maintenance -->
      ${openMaintenance.length > 0 ? `
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Open maintenance (${openMaintenance.length})</p>
      <div style="margin-bottom:20px;">
        ${openMaintenance.map((t) => `
        <div style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;">
          <p style="margin:0;font-size:12px;color:#374151;">${t.title}</p>
          <span style="font-size:11px;color:#6b7280;">${t.urgency}</span>
        </div>`).join("")}
      </div>
      ` : ""}

      <!-- CTA -->
      <a href="${dashboardUrl}" style="display:block;text-align:center;background:#0d1b2a;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:13px;font-weight:500;margin-top:8px;">
        Open Norva dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:12px 24px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
        Norva · Your portfolio operations platform ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/notifications" style="color:#9ca3af;">Manage notifications</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

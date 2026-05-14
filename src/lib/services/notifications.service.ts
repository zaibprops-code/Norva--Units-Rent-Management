// =============================================================================
// NOTIFICATIONS SERVICE — Resend email sending
// Wraps Resend SDK with typed helpers and communication log writes.
// All outbound emails go through sendEmail() to ensure logging.
// =============================================================================
import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/server";
import { EMAIL } from "@/constants";
import type { InsertCommunication } from "@/types";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("[notifications] RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  // For logging
  orgId: string;
  tenantId?: string;
  alertId?: string;
  ticketId?: string;
}

export interface SendEmailResult {
  messageId: string | null;
  error: Error | null;
}

/**
 * Send an email via Resend and log it to the communications table.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const resend = getResend();

  let messageId: string | null = null;
  let sendError: Error | null = null;

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL.FROM_NAME} <${EMAIL.FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo ?? EMAIL.REPLY_TO,
    });

    if (error) throw new Error(error.message);
    messageId = data?.id ?? null;
  } catch (err) {
    sendError = err instanceof Error ? err : new Error("Email send failed");
    console.error("[notifications.service] sendEmail error:", sendError.message);
  }

  // Log to communications table regardless of success
  try {
    const supabase = createAdminClient();
    const logEntry: InsertCommunication = {
      org_id: options.orgId,
      tenant_id: options.tenantId ?? null,
      alert_id: options.alertId ?? null,
      ticket_id: options.ticketId ?? null,
      channel: "email",
      direction: "outbound",
      recipient: options.to,
      subject: options.subject,
      body: options.html,
      status: sendError ? "failed" : "sent",
      provider_message_id: messageId,
    };
    await supabase.from("communications").insert(logEntry);
  } catch (logErr) {
    console.error("[notifications.service] Failed to log communication:", logErr);
  }

  return { messageId, error: sendError };
}

/**
 * Send a tenant reminder email using a plain-text template.
 * Used by the rent escalation workflow (no AI, just templates).
 */
export async function sendTenantRentReminder(opts: {
  orgId: string;
  tenantId: string;
  tenantEmail: string;
  tenantName: string;
  amount: number;
  daysOverdue: number;
  paymentLink?: string | null;
  landlordName: string;
}): Promise<SendEmailResult> {
  const isFirst = opts.daysOverdue <= 1;
  const subject = isFirst
    ? `Rent reminder — ${opts.landlordName}`
    : `Important: Your rent payment is overdue`;

  const paymentSection = opts.paymentLink
    ? `<p style="margin:16px 0;">
        <a href="${opts.paymentLink}" style="display:inline-block;background:#0d1b2a;color:#fff;
           padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">
          Pay now →
        </a>
       </p>`
    : `<p style="color:#374151;font-size:14px;">Please arrange payment with ${opts.landlordName} as soon as possible.</p>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
<div style="max-width:480px;margin:24px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
  <div style="background:#0d1b2a;padding:16px 24px;">
    <span style="color:#fff;font-weight:600;font-size:15px;letter-spacing:.04em;">Norva</span>
  </div>
  <div style="padding:24px;">
    <p style="color:#374151;font-size:15px;margin:0 0 12px;">Hi ${opts.tenantName},</p>
    ${isFirst
      ? `<p style="color:#374151;font-size:14px;">This is a friendly reminder that your rent payment of <strong>$${opts.amount}</strong> is due. Please arrange payment at your earliest convenience.</p>`
      : `<p style="color:#374151;font-size:14px;">Your rent payment of <strong>$${opts.amount}</strong> is now <strong>${opts.daysOverdue} days overdue</strong>. Please pay immediately to avoid additional late fees.</p>`
    }
    ${paymentSection}
    <p style="color:#6b7280;font-size:13px;margin-top:20px;">Questions? Reply to this email or contact ${opts.landlordName} directly.</p>
  </div>
  <div style="padding:12px 24px;border-top:1px solid #f3f4f6;background:#f9fafb;">
    <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
      Sent on behalf of ${opts.landlordName} via Norva
    </p>
  </div>
</div>
</body></html>`;

  return sendEmail({
    to: opts.tenantEmail,
    subject,
    html,
    orgId: opts.orgId,
    tenantId: opts.tenantId,
  });
}

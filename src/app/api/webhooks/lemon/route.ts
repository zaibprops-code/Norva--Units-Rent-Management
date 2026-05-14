// =============================================================================
// LEMON SQUEEZY WEBHOOK — POST /api/webhooks/lemon
// Handles subscription lifecycle events from Lemon Squeezy.
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

import { createAdminClient } from "@/lib/supabase/server";

// Verify webhook signature from Lemon Squeezy
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifySignature(body, signature)) {
    console.error("[LEMON_WEBHOOK] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = (event.meta as Record<string, unknown>)?.event_name as string;
  const data = event.data as Record<string, unknown>;
  const attributes = data?.attributes as Record<string, unknown>;
  const customData = (event.meta as Record<string, unknown>)?.custom_data as Record<string, string>;
  const orgId = customData?.org_id;

  if (!orgId) {
    console.error("[LEMON_WEBHOOK] No org_id in custom_data");
    return NextResponse.json({ error: "Missing org_id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        await supabase
          .from("organizations")
          .update({
            lemon_subscription_id: String(data.id),
            lemon_customer_id: String(attributes.customer_id),
            lemon_subscription_status: String(attributes.status),
            plan: resolvePlan(String(attributes.variant_id)),
          })
          .eq("id", orgId);
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        await supabase
          .from("organizations")
          .update({
            lemon_subscription_status: String(attributes.status),
            plan: "starter",
          })
          .eq("id", orgId);
        break;

      case "subscription_paused":
        await supabase
          .from("organizations")
          .update({ lemon_subscription_status: "paused" })
          .eq("id", orgId);
        break;

      default:
        // Non-subscription events — log and ignore
        console.warn("[LEMON_WEBHOOK] Unhandled event:", eventName);
    }
  } catch (err) {
    console.error("[LEMON_WEBHOOK] DB error:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function resolvePlan(variantId: string): "starter" | "growth" | "portfolio" {
  if (variantId === process.env.LEMONSQUEEZY_GROWTH_VARIANT_ID) return "growth";
  if (variantId === process.env.LEMONSQUEEZY_PORTFOLIO_VARIANT_ID) return "portfolio";
  return "starter";
}

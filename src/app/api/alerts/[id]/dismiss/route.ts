// =============================================================================
// DISMISS ALERT — POST /api/alerts/[id]/dismiss
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
    if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error } = await supabase
      .from("alerts")
      .update({ status: "dismissed" })
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    await supabase.from("activity_log").insert({
      org_id: org.id,
      entity_type: "alert",
      entity_id: id,
      action: "dismissed",
      actor: user.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DISMISS_ALERT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

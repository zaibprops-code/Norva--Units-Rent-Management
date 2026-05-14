// =============================================================================
// RESOLVE ALERT — POST /api/alerts/[id]/resolve
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
    if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const resolutionNote = body.resolution_note ?? "Resolved by landlord";

    const { error } = await supabase
      .from("alerts")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        resolution_note: resolutionNote,
      })
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    // Log the action
    await supabase.from("activity_log").insert({
      org_id: org.id,
      entity_type: "alert",
      entity_id: id,
      action: "resolved",
      actor: user.id,
      metadata: { resolution_note: resolutionNote },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESOLVE_ALERT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

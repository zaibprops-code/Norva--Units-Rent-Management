// =============================================================================
// RESOLVE ALERT — POST /api/alerts/[id]/resolve
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getOrgId } from "@/lib/utils/server-helpers";
import type { Database } from "@/types/database";

type AlertUpdatePayload = Database["public"]["Tables"]["alerts"]["Update"];
type ActivityLogInsertPayload = Database["public"]["Tables"]["activity_log"]["Insert"];

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrgId(user.id);
    if (!orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const resolutionNote = (body as { resolution_note?: string }).resolution_note ?? "Resolved by landlord";

    const updatePayload: AlertUpdatePayload = {
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_note: resolutionNote,
    };

    const { error } = await supabase
      .from("alerts")
      .update(updatePayload as never)
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    const logPayload: ActivityLogInsertPayload = {
      org_id: orgId,
      entity_type: "alert",
      entity_id: id,
      action: "resolved",
      actor: user.id,
      metadata: { resolution_note: resolutionNote },
    };

    await supabase.from("activity_log").insert(logPayload as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESOLVE_ALERT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

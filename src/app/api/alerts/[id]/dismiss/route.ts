// =============================================================================
// DISMISS ALERT — POST /api/alerts/[id]/dismiss
// =============================================================================
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getOrgId } from "@/lib/utils/server-helpers";
import type { Database } from "@/types/database";

type AlertUpdatePayload = Database["public"]["Tables"]["alerts"]["Update"];
type ActivityLogInsertPayload = Database["public"]["Tables"]["activity_log"]["Insert"];

interface Params { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrgId(user.id);
    if (!orgId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatePayload: AlertUpdatePayload = { status: "dismissed" };

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
      action: "dismissed",
      actor: user.id,
      metadata: {},
    };

    await supabase.from("activity_log").insert(logPayload as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DISMISS_ALERT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

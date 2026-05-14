// =============================================================================
// SUPABASE BROWSER CLIENT
// Use in Client Components ("use client") only.
// Creates a singleton client for the browser session.
// =============================================================================
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

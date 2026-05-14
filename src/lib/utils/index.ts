// =============================================================================
// UTILITIES — CLIENT-SAFE BARREL EXPORT
//
// ✅ Safe to import from ANY file: Server Components, Client Components,
//    Route Handlers, Server Actions, hooks, anywhere.
//
// This file intentionally does NOT export server-only utilities.
// Server-only utilities must be imported from their specific files:
//
//   import { requireAuth, verifyCronSecret } from "@/lib/utils/auth"
//     → Server Components, Server Actions, Route Handlers only
//
//   import { ok, badRequest, serverError } from "@/lib/utils/response"
//     → Route Handlers only
//
//   import { env, validateServerEnv } from "@/lib/utils/env"
//     → Server Components, Server Actions, Route Handlers only
//
// WHY: next/headers (used by @/lib/supabase/server, which auth.ts imports)
// is a server-only module. If it reaches a Client Component bundle via a
// barrel export, Next.js throws a build error.
// =============================================================================

// Pure utilities — no server imports, safe everywhere
export * from "./cn";
export * from "./dates";
export * from "./urgency";
export * from "./formatting";
export * from "./plans";
export * from "./api";        // browser fetch wrappers (uses global fetch)
export * from "./pagination";
export * from "./filter";
export * from "./trs";

// ⛔ NEVER re-add these to this barrel:
// export * from "./auth";      → imports @/lib/supabase/server → next/headers
// export * from "./response";  → imports next/server (NextResponse)
// export * from "./env";       → server environment variable patterns

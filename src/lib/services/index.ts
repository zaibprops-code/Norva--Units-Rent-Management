// =============================================================================
// SERVICES — SERVER-ONLY BARREL
//
// ⚠️  ALL services here import from @/lib/supabase/server which requires
//     next/headers. This barrel is SERVER-ONLY.
//
// ✅ Safe to import from:
//    - Server Components (app/dashboard/**/page.tsx, layout.tsx)
//    - Server Actions (src/actions/*.ts)
//    - Route Handlers (src/app/api/**/route.ts)
//
// ❌ NEVER import from:
//    - Client Components ("use client" files)
//    - Custom hooks (src/lib/hooks/*.ts) — use Supabase browser client instead
//    - Any file that may be bundled for the client
//
// Client Components fetch data via hooks (useAlerts, useProperties, etc.)
// which use the browser-side Supabase client directly.
// =============================================================================
export * from "./alerts.service";
export * from "./payments.service";
export * from "./tenants.service";
export * from "./dashboard.service";
export * from "./notifications.service";

// =============================================================================
// APP PROVIDERS
// Global provider wrapper. Kept minimal at MVP — the Toaster is already
// in root layout.tsx. This file is the extension point for any future
// providers (React Query, SWR, theme context, etc.) without touching layout.
// =============================================================================
"use client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// =============================================================================
// ENVIRONMENT VALIDATION
// Validates required env vars at startup. Fails loudly in development.
// Import validateServerEnv() at the top of server-only entry points.
// =============================================================================

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "APP_SECRET",
] as const;

/**
 * Call inside server-only code (API routes, server actions) to
 * hard-fail when critical env vars are missing in development.
 */
export function validateServerEnv(): void {
  if (process.env.NODE_ENV === "test") return;

  const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[Norva] Missing required environment variables:\n` +
        missing.map((k) => `  • ${k}`).join("\n") +
        `\n\nCopy .env.example to .env.local and fill in the values.`
    );
  }
}

/**
 * Typed, centralised access to environment variables.
 * Use this instead of process.env throughout the codebase.
 */
export const env = {
  // Public (safe to expose to browser)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Norva",

  // Server-only (never expose to browser)
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  appSecret: process.env.APP_SECRET ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  lemonApiKey: process.env.LEMONSQUEEZY_API_KEY ?? "",
  lemonWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  lemonStoreId: process.env.LEMONSQUEEZY_STORE_ID ?? "",

  // Lemon Squeezy plan variant IDs
  lemonStarterVariantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID ?? "",
  lemonGrowthVariantId: process.env.LEMONSQUEEZY_GROWTH_VARIANT_ID ?? "",
  lemonPortfolioVariantId: process.env.LEMONSQUEEZY_PORTFOLIO_VARIANT_ID ?? "",
} as const;

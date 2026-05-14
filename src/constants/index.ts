// ============================================================================
// NORVA — Application Constants
// ============================================================================

// ============================================================================
// URGENCY SCORING
// Rule-based scoring — no AI needed for these calculations.
// ============================================================================

export const URGENCY_WEIGHTS = {
  // Rent overdue scoring
  RENT_PER_DAY_OVERDUE: 12,           // 12 points per day (caps at 60 from days alone)
  RENT_MAX_DAYS_COMPONENT: 60,
  RENT_PER_PREVIOUS_MISS: 8,          // Each historical miss adds 8 points
  RENT_TRS_THRESHOLD: 70,             // TRS below this adds urgency
  RENT_TRS_PENALTY_DIVISOR: 2,        // (70 - trs) / 2 = penalty points

  // Maintenance urgency scores
  MAINTENANCE_EMERGENCY: 90,
  MAINTENANCE_URGENT: 65,
  MAINTENANCE_STANDARD: 40,
  MAINTENANCE_LOW: 20,
} as const;

// ============================================================================
// RENT ESCALATION SCHEDULE
// Days after grace period expires → escalation level and action
// ============================================================================

export const RENT_ESCALATION = {
  LEVEL_0_DAYS: 0,     // Due date + grace period: friendly reminder
  LEVEL_1_DAYS: 2,     // Day 2: follow-up + landlord notification
  LEVEL_2_DAYS: 5,     // Day 5: formal notice + landlord decision required
  LEVEL_3_DAYS: 7,     // Day 7+: demand notice — human approval required
} as const;

// ============================================================================
// LEASE EXPIRATION WINDOWS
// Days before lease end → trigger actions
// ============================================================================

export const LEASE_EXPIRY = {
  ANALYSIS_TRIGGER_DAYS: 90,          // Run renewal analysis at 90 days
  REMINDER_DAYS: 60,                  // Remind landlord at 60 days
  URGENT_DAYS: 30,                    // Escalate urgency at 30 days
} as const;

// ============================================================================
// QUIET TENANT DETECTION
// ============================================================================

export const QUIET_TENANT = {
  THRESHOLD_DAYS: 21,                 // Flag if no contact in 21 days
  MIN_TRS_FOR_ANOMALY: 70,            // Only flag if tenant was previously active
  FOLLOWUP_DAYS: 7,                   // Days to wait for response after wellness check
} as const;

// ============================================================================
// MAINTENANCE EMERGENCY KEYWORDS
// Case-insensitive, checked against ticket description.
// ============================================================================

export const EMERGENCY_KEYWORDS = [
  "gas leak",
  "gas smell",
  "flooding",
  "flood",
  "fire",
  "smoke",
  "no heat",
  "no power",
  "no electricity",
  "sewage",
  "sewer",
  "break in",
  "break-in",
  "broken lock",
  "ceiling collapse",
  "ceiling fell",
  "burst pipe",
  "pipe burst",
  "carbon monoxide",
  "co detector",
  "mold",
  "structural",
] as const;

// ============================================================================
// EMAIL SETTINGS
// ============================================================================

export const EMAIL = {
  FROM_ADDRESS:
    process.env.RESEND_FROM_EMAIL ?? "alerts@norva.io",
  FROM_NAME: process.env.RESEND_FROM_NAME ?? "Norva",
  REPLY_TO: "support@norva.io",
} as const;

// ============================================================================
// LEMON SQUEEZY PLAN VARIANT IDs
// ============================================================================

export const LS_VARIANTS = {
  STARTER: process.env.LEMONSQUEEZY_VARIANT_STARTER ?? "",
  GROWTH: process.env.LEMONSQUEEZY_VARIANT_GROWTH ?? "",
  PORTFOLIO: process.env.LEMONSQUEEZY_VARIANT_PORTFOLIO ?? "",
} as const;

// ============================================================================
// CRON SCHEDULE EXPRESSIONS
// ============================================================================

export const CRON_SCHEDULES = {
  RENT_CHECK: "0 7 * * *",           // 7:00 AM daily
  DAILY_DIGEST: "30 6 * * *",        // 6:30 AM daily
  LEASE_SCANNER: "0 6 * * *",        // 6:00 AM daily
  QUIET_TENANT: "0 9 * * 1",         // 9:00 AM every Monday
} as const;

// ============================================================================
// APP ROUTES
// ============================================================================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/dashboard/properties",
  PROPERTY_NEW: "/dashboard/properties/new",
  TENANTS: "/dashboard/tenants",
  MAINTENANCE: "/dashboard/maintenance",
  DIGEST: "/dashboard/digest",
  SETTINGS: "/dashboard/settings",
  SETTINGS_BILLING: "/dashboard/settings/billing",
  SETTINGS_NOTIFICATIONS: "/dashboard/settings/notifications",
} as const;

// =============================================================================
// APPLICATION TYPES
// Domain types, API response shapes, and UI state types.
// Database row/insert/update types live in ./database.ts and are re-exported here.
// =============================================================================

export type * from "./database";

// -----------------------------------------------------------------------------
// Plan types
// -----------------------------------------------------------------------------
export type PlanId = "starter" | "growth" | "portfolio";

export interface PlanFeatures {
  unitLimit: number;
  userLimit: number;
  automatedReminders: boolean;
  maintenanceTriage: boolean;
  dailyDigest: boolean;
  tenantSms: boolean;
  leaseRenewalAnalysis: boolean;
  trsScoring: boolean;
  apiAccess: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  features: PlanFeatures;
  variantId: string;
}

// -----------------------------------------------------------------------------
// Alert display types
// -----------------------------------------------------------------------------
export type AlertType =
  | "overdue_rent"
  | "failed_payment"
  | "lease_expiring"
  | "maintenance_request"
  | "quiet_tenant"
  | "contractor_delay";

export type AlertStatus = "active" | "resolved" | "dismissed" | "snoozed";

// UrgencyLevel is a pure type — the getUrgencyLevel() function that
// maps a numeric score to this type lives in @/lib/utils/urgency.ts.
// Do NOT duplicate the function here.
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

// Alert with joined relations for display in the operations feed
export interface AlertWithRelations {
  id: string;
  type: AlertType;
  status: AlertStatus;
  urgency: number;
  urgencyLevel: UrgencyLevel;
  title: string;
  body: string | null;
  recommended_action: string | null;
  escalation_level: number;
  created_at: string;
  property?: {
    id: string;
    name: string;
  } | null;
  unit?: {
    id: string;
    unit_number: string;
  } | null;
  tenant?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    trs_score: number;
  } | null;
}

// -----------------------------------------------------------------------------
// API response envelope types
// -----------------------------------------------------------------------------
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// -----------------------------------------------------------------------------
// Portfolio stats (used by dashboard Server Component + PortfolioStats component)
// -----------------------------------------------------------------------------
export interface PortfolioStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  overdueCount: number;
  openMaintenanceCount: number;
  healthScore: number;
}

// -----------------------------------------------------------------------------
// Notification preferences (for settings page)
// -----------------------------------------------------------------------------
export interface NotificationPreferences {
  emailAlerts: boolean;
  digestEnabled: boolean;
  digestTime: string; // "07:00"
  criticalAlertsSms: boolean;
}

// -----------------------------------------------------------------------------
// Urgency scoring input (consumed by @/lib/utils/urgency.ts)
// -----------------------------------------------------------------------------
export interface RentUrgencyInput {
  daysOverdue: number;
  previousMissedPayments: number;
  trsScore: number;
  gracePeriodDays: number;
}

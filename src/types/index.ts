// =============================================================================
// APPLICATION TYPES
// Domain types, API response shapes, and UI state types.
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
// Alert types (extended with relations)
// -----------------------------------------------------------------------------
export type AlertType =
  | "overdue_rent"
  | "failed_payment"
  | "lease_expiring"
  | "maintenance_request"
  | "quiet_tenant"
  | "contractor_delay";

export type AlertStatus = "active" | "resolved" | "dismissed" | "snoozed";

export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

// Alert with joined relations for display
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
// API response types
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
// Portfolio stats (for dashboard)
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
// Notification preferences
// -----------------------------------------------------------------------------
export interface NotificationPreferences {
  emailAlerts: boolean;
  digestEnabled: boolean;
  digestTime: string; // "07:00"
  criticalAlertsSms: boolean;
}

// -----------------------------------------------------------------------------
// Urgency scoring input
// -----------------------------------------------------------------------------
export interface RentUrgencyInput {
  daysOverdue: number;
  previousMissedPayments: number;
  trsScore: number;
  gracePeriodDays: number;
}

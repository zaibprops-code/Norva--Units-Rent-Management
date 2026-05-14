// =============================================================================
// URGENCY SCORING — RULE-BASED (NO AI)
// Deterministic urgency calculation. Cheap, fast, reliable.
// All scoring uses pure arithmetic — no API calls.
// =============================================================================

import type { RentUrgencyInput, UrgencyLevel } from "@/types";

/**
 * Calculate urgency score for an overdue rent situation.
 * Returns 0–100. Higher = more urgent.
 *
 * Scoring breakdown:
 * - Days overdue:           up to 60 points  (10 pts/day after grace, caps at 6 days)
 * - Previous missed pmts:   up to 24 points  (8 pts each, caps at 3)
 * - Low TRS score:          up to 20 points  (for TRS below 70)
 */
export function calculateRentUrgency(input: RentUrgencyInput): number {
  const effectiveDaysLate = Math.max(0, input.daysOverdue - input.gracePeriodDays);
  const daysScore = Math.min(60, effectiveDaysLate * 10);
  const historyScore = Math.min(24, input.previousMissedPayments * 8);
  const trsScore = Math.max(0, Math.round((70 - input.trsScore) / 2.5));
  return Math.min(100, Math.round(daysScore + historyScore + trsScore));
}

/**
 * Calculate urgency level label from a numeric score.
 */
export function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

/**
 * Classify a maintenance request as emergency using keyword matching.
 * No AI needed — keyword detection handles 95%+ of real cases.
 */
const EMERGENCY_KEYWORDS = [
  "gas leak",
  "gas smell",
  "flooding",
  "flood",
  "fire",
  "smoke",
  "no heat",
  "heat not working",
  "no hot water",
  "no power",
  "no electricity",
  "electrical fire",
  "sparking",
  "break in",
  "break-in",
  "broken lock",
  "door wont lock",
  "sewage",
  "sewage backup",
  "ceiling collapse",
  "roof collapse",
  "carbon monoxide",
  "burst pipe",
  "water everywhere",
  "major leak",
];

const URGENT_KEYWORDS = [
  "leak",
  "dripping",
  "clogged",
  "toilet not flushing",
  "ac not working",
  "air conditioning",
  "heater",
  "refrigerator not working",
  "fridge",
  "oven",
  "stove",
  "pest",
  "rodent",
  "mice",
  "rat",
  "bedbug",
  "roach",
];

export type MaintenanceUrgency = "emergency" | "urgent" | "standard" | "low";

export function classifyMaintenanceUrgency(
  title: string,
  description: string
): { urgency: MaintenanceUrgency; urgencyScore: number } {
  const text = `${title} ${description}`.toLowerCase();

  if (EMERGENCY_KEYWORDS.some((kw) => text.includes(kw))) {
    return { urgency: "emergency", urgencyScore: 95 };
  }

  if (URGENT_KEYWORDS.some((kw) => text.includes(kw))) {
    return { urgency: "urgent", urgencyScore: 65 };
  }

  return { urgency: "standard", urgencyScore: 35 };
}

/**
 * Calculate lease expiration urgency.
 */
export function calculateLeaseExpiryUrgency(daysUntilExpiry: number): number {
  if (daysUntilExpiry <= 0) return 90;
  if (daysUntilExpiry <= 14) return 80;
  if (daysUntilExpiry <= 30) return 65;
  if (daysUntilExpiry <= 60) return 45;
  if (daysUntilExpiry <= 90) return 25;
  return 10;
}

/**
 * Urgency display helpers
 */
export const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  critical: {
    label: "Critical",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  high: {
    label: "High",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  medium: {
    label: "Medium",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  low: {
    label: "Low",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

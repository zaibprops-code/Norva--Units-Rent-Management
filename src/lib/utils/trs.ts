// =============================================================================
// TENANT RELIABILITY SCORE (TRS) — RULE-BASED, NO AI
// Recalculated from payment history on significant payment events.
// Score range: 0–100. Starting baseline for new tenants: 75.
// =============================================================================

interface TRSInput {
  totalPayments: number;
  onTimePayments: number;   // paid within grace period
  latePayments: number;     // paid but more than 5 days late
  missedPayments: number;   // failed or still pending past due
  monthsTenancy: number;
}

/**
 * Calculate a Tenant Reliability Score (0–100).
 *
 * Formula:
 *   Base 75
 *   + On-time rate adjustment (-25 to +20)
 *   - Missed payments penalty (8 pts each, max -32)
 *   + Tenancy length bonus (+1 per 6 months, max +5)
 */
export function calculateTRS(input: TRSInput): number {
  if (input.totalPayments === 0) return 75; // No history → neutral

  const BASE = 75;
  const onTimeRate = input.onTimePayments / input.totalPayments;

  // On-time rate: (rate - 0.80) * 100  → range approx -80 to +20
  // Clamp to -25..+20 to prevent extreme swings on small samples
  const rawRateAdj = Math.round((onTimeRate - 0.8) * 100);
  const rateAdj = Math.max(-25, Math.min(20, rawRateAdj));

  const missPenalty = Math.min(32, input.missedPayments * 8);
  const tenancyBonus = Math.min(5, Math.floor(input.monthsTenancy / 6));

  return Math.max(0, Math.min(100, BASE + rateAdj - missPenalty + tenancyBonus));
}

/**
 * Build TRSInput from raw payment records.
 *
 * "On time" = paid_date within 5 days of due_date.
 * "Missed"  = status failed, or status pending with due_date in the past.
 */
export function buildTRSInput(
  payments: Array<{
    status: string;
    due_date: string;
    paid_date: string | null;
  }>,
  leaseStart: string
): TRSInput {
  const now = new Date();
  const start = new Date(leaseStart);
  const monthsTenancy = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  const totalPayments = payments.length;

  const onTimePayments = payments.filter((p) => {
    if (p.status !== "paid" || !p.paid_date) return false;
    const diffDays =
      (new Date(p.paid_date).getTime() - new Date(p.due_date).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays <= 5;
  }).length;

  const latePayments = payments.filter((p) => {
    if (p.status !== "paid" || !p.paid_date) return false;
    const diffDays =
      (new Date(p.paid_date).getTime() - new Date(p.due_date).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays > 5;
  }).length;

  const missedPayments = payments.filter(
    (p) =>
      p.status === "failed" ||
      (p.status === "pending" && new Date(p.due_date) < now)
  ).length;

  return {
    totalPayments,
    onTimePayments,
    latePayments,
    missedPayments,
    monthsTenancy,
  };
}

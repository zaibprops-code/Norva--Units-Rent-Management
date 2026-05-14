// =============================================================================
// PLAN CONFIGURATION & FEATURE GATING
// Single source of truth for subscription plans and feature access.
// =============================================================================

import type { Plan, PlanId } from "@/types";

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 49,
    variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID ?? "",
    features: {
      unitLimit: 10,
      userLimit: 1,
      automatedReminders: true,
      maintenanceTriage: true,
      dailyDigest: true,
      tenantSms: false,
      leaseRenewalAnalysis: false,
      trsScoring: false,
      apiAccess: false,
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 99,
    variantId: process.env.LEMONSQUEEZY_GROWTH_VARIANT_ID ?? "",
    features: {
      unitLimit: 30,
      userLimit: 3,
      automatedReminders: true,
      maintenanceTriage: true,
      dailyDigest: true,
      tenantSms: true,
      leaseRenewalAnalysis: true,
      trsScoring: true,
      apiAccess: false,
    },
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio",
    priceMonthly: 199,
    variantId: process.env.LEMONSQUEEZY_PORTFOLIO_VARIANT_ID ?? "",
    features: {
      unitLimit: 75,
      userLimit: 10,
      automatedReminders: true,
      maintenanceTriage: true,
      dailyDigest: true,
      tenantSms: true,
      leaseRenewalAnalysis: true,
      trsScoring: true,
      apiAccess: true,
    },
  },
};

/**
 * Check if a plan has access to a specific feature.
 */
export function hasFeature(
  plan: PlanId,
  feature: keyof Plan["features"]
): boolean {
  return Boolean(PLANS[plan]?.features[feature]);
}

/**
 * Check if a plan is within unit limits.
 */
export function withinUnitLimit(plan: PlanId, currentUnits: number): boolean {
  return currentUnits < PLANS[plan].features.unitLimit;
}

/**
 * Get the plan object by ID.
 */
export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

/**
 * Get all plans as an array (for pricing pages).
 */
export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

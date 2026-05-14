// =============================================================================
// FORMATTING UTILITIES
// Consistent display formatting across the app.
// =============================================================================

/**
 * Format a tenant's full name
 */
export function formatTenantName(
  firstName: string,
  lastName: string
): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Get tenant initials for avatar display
 */
export function getTenantInitials(
  firstName: string,
  lastName: string
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format a phone number for display
 * Input: "7025550184" → Output: "(702) 555-0184"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Format a unit code for display (e.g., "CL-05", "1A", "Unit 3")
 */
export function formatUnitCode(unitNumber: string): string {
  return unitNumber.trim();
}

/**
 * Format an address for display
 */
export function formatAddress(
  address: string,
  city?: string | null,
  state?: string | null,
  zip?: string | null
): string {
  const parts = [address];
  if (city && state) {
    parts.push(`${city}, ${state}`);
  } else if (city) {
    parts.push(city);
  } else if (state) {
    parts.push(state);
  }
  if (zip) parts.push(zip);
  return parts.join(", ");
}

/**
 * Format a currency amount as USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format alert type for display
 */
export function formatAlertType(type: string): string {
  const labels: Record<string, string> = {
    overdue_rent: "Overdue Rent",
    failed_payment: "Failed Payment",
    lease_expiring: "Lease Expiring",
    maintenance_request: "Maintenance",
    quiet_tenant: "Quiet Tenant",
    contractor_delay: "Contractor Delay",
  };
  return labels[type] ?? type;
}

/**
 * Truncate a long string with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/**
 * Convert a TRS score to a label
 */
export function formatTRSLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

export function getTRSColor(score: number): string {
  if (score >= 85) return "text-green-700 bg-green-50";
  if (score >= 70) return "text-blue-700 bg-blue-50";
  if (score >= 50) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

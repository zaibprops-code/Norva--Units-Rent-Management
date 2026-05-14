// =============================================================================
// DATE UTILITIES
// Consistent date formatting and calculation across the app.
// =============================================================================
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  parseISO,
  isToday,
  isYesterday,
  addDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";

/**
 * Format a date string for display (e.g., "Jan 15, 2025")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date for display in alerts (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatAlertDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d 'at' h:mm a");
}

/**
 * Calculate days between two dates (positive = date2 is in the future)
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
}

/**
 * Get days until a future date (negative = already past)
 */
export function daysUntil(futureDate: string | Date): number {
  return daysBetween(new Date(), futureDate);
}

/**
 * Get days since a past date
 */
export function daysSince(pastDate: string | Date): number {
  return daysBetween(pastDate, new Date());
}

/**
 * Get rent due date for current month given a day-of-month
 */
export function getRentDueDate(dueDayOfMonth: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), dueDayOfMonth);
}

/**
 * Format a currency amount (USD)
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
 * Format a lease date range (e.g., "Jan 1, 2024 – Dec 31, 2024")
 */
export function formatLeaseRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

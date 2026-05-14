// =============================================================================
// DATE UTILITIES
// Consistent date formatting and calculation across the app.
// Client-safe: no server imports.
// =============================================================================
import {
  format,
  formatDistanceToNow,
  differenceInDays,
  parseISO,
  isToday,
  isYesterday,
} from "date-fns";

/**
 * Format a date string for display (e.g., "Jan 15, 2025")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date as relative time with special-casing for today/yesterday.
 * (e.g., "Today", "Yesterday", "3 days ago")
 */
export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date for alert display with time component.
 * (e.g., "Today at 9:22 AM", "Yesterday at 3:14 AM", "Jan 15 at 7:00 AM")
 */
export function formatAlertDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d 'at' h:mm a");
}

/**
 * Days between two dates. Positive = date2 is in the future.
 */
export function daysBetween(
  date1: string | Date,
  date2: string | Date
): number {
  const d1 = typeof date1 === "string" ? parseISO(date1) : date1;
  const d2 = typeof date2 === "string" ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
}

/**
 * Days until a future date. Negative = already past.
 */
export function daysUntil(futureDate: string | Date): number {
  return daysBetween(new Date(), futureDate);
}

/**
 * Days since a past date.
 */
export function daysSince(pastDate: string | Date): number {
  return daysBetween(pastDate, new Date());
}

/**
 * Get the rent due date for the current month given a day-of-month number.
 */
export function getRentDueDate(dueDayOfMonth: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), dueDayOfMonth);
}

/**
 * Format a lease date range (e.g., "Jan 1, 2024 – Dec 31, 2024")
 */
export function formatLeaseRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

// NOTE: formatCurrency lives in formatting.ts — do not duplicate here.
// The barrel (utils/index.ts) re-exports both files so formatCurrency
// is available from "@/lib/utils" without conflict.

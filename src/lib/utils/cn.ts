// =============================================================================
// CLASS NAME UTILITY
// Merges Tailwind classes intelligently, resolving conflicts.
// Usage: cn("px-4 py-2", isActive && "bg-blue-500", className)
// =============================================================================
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

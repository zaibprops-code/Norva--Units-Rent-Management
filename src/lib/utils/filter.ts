// =============================================================================
// FILTER & SEARCH UTILITIES
// Pure client-side filtering for in-memory data sets.
// For large data sets, push filtering to Supabase query level.
// =============================================================================
import type { Alert, Tenant, MaintenanceTicket } from "@/types";

// ---------------------------------------------------------------------------
// Alert filtering
// ---------------------------------------------------------------------------
export interface AlertFilters {
  type?: string;
  urgencyMin?: number;
  search?: string;
}

export function filterAlerts(
  alerts: Alert[],
  filters: AlertFilters
): Alert[] {
  return alerts.filter((alert) => {
    if (
      filters.type &&
      filters.type !== "all" &&
      alert.type !== filters.type
    )
      return false;

    if (filters.urgencyMin != null && alert.urgency < filters.urgencyMin)
      return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inTitle = alert.title.toLowerCase().includes(q);
      const inBody = (alert.body ?? "").toLowerCase().includes(q);
      if (!inTitle && !inBody) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Tenant filtering
// ---------------------------------------------------------------------------
export interface TenantFilters {
  search?: string;
  trsMin?: number;
  trsMax?: number;
}

export function filterTenants(
  tenants: Tenant[],
  filters: TenantFilters
): Tenant[] {
  return tenants.filter((t) => {
    if (filters.trsMin != null && t.trs_score < filters.trsMin) return false;
    if (filters.trsMax != null && t.trs_score > filters.trsMax) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const name = `${t.first_name} ${t.last_name}`.toLowerCase();
      const email = (t.email ?? "").toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Maintenance filtering
// ---------------------------------------------------------------------------
export interface MaintenanceFilters {
  status?: string;
  urgency?: string;
  search?: string;
}

export function filterTickets(
  tickets: MaintenanceTicket[],
  filters: MaintenanceFilters
): MaintenanceTicket[] {
  return tickets.filter((t) => {
    if (
      filters.status &&
      filters.status !== "all" &&
      t.status !== filters.status
    )
      return false;

    if (
      filters.urgency &&
      filters.urgency !== "all" &&
      t.urgency !== filters.urgency
    )
      return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = (t.description ?? "").toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }

    return true;
  });
}

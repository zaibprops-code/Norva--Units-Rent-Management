// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function getPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/** Convert page + pageSize into Supabase range args */
export function getSupabaseRange(
  page: number,
  pageSize: number
): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

/** Safely parse a page number from a URL search param */
export function parsePage(
  searchParam: string | string[] | undefined
): number {
  const raw = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const parsed = parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/** Default page sizes used across the app */
export const PAGE_SIZES = {
  alerts: 50,
  tenants: 25,
  properties: 25,
  maintenance: 25,
  payments: 12,
  communications: 20,
  activity: 30,
} as const;

// =============================================================================
// API CLIENT HELPERS
// Typed fetch wrappers for internal /api/* routes.
// Use in Client Components — these run in the browser.
// =============================================================================

type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json", ...init.headers },
      ...init,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      return { data: null, error: body.error ?? `HTTP ${res.status}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ---------------------------------------------------------------------------
// Alert endpoints
// ---------------------------------------------------------------------------
export async function apiResolveAlert(alertId: string, note?: string) {
  return apiFetch<{ success: boolean }>(`/api/alerts/${alertId}/resolve`, {
    method: "POST",
    body: JSON.stringify({ resolution_note: note ?? "Resolved by landlord" }),
  });
}

export async function apiDismissAlert(alertId: string) {
  return apiFetch<{ success: boolean }>(`/api/alerts/${alertId}/dismiss`, {
    method: "POST",
  });
}

// ---------------------------------------------------------------------------
// Maintenance endpoints
// ---------------------------------------------------------------------------
export async function apiUpdateTicketStatus(
  ticketId: string,
  status: string,
  note?: string
) {
  return apiFetch<{ success: boolean }>(
    `/api/maintenance/${ticketId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }
  );
}

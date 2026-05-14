"use client";

import { useEffect, useState, useCallback } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Alert } from "@/types";

interface UseAlertsOptions {
  orgId: string;
  status?: "active" | "resolved" | "dismissed";
  limit?: number;
}

interface UseAlertsResult {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAlerts({
  orgId,
  status = "active",
  limit = 50,
}: UseAlertsOptions): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("alerts")
        .select(
          `*,
           properties:property_id(id, name),
           units:unit_id(id, unit_number),
           tenants:tenant_id(id, first_name, last_name, email, phone, trs_score)`
        )
        .eq("org_id", orgId)
        .eq("status", status)
        .order("urgency", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (dbError) throw dbError;
      setAlerts((data ?? []) as Alert[]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load alerts"
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, status, limit]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Realtime subscription — re-fetch on any change to this org's alerts
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`alerts-hook-${orgId}-${status}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `org_id=eq.${orgId}`,
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, status, fetchAlerts]);

  return { alerts, loading, error, refetch: fetchAlerts };
}

// =============================================================================
// OPERATIONS FEED — Client Component
// Real-time feed of all active and recently resolved alerts.
// Subscribes to Supabase Realtime for live updates.
// =============================================================================
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui";
import { AlertCard } from "./AlertCard";
import type { Alert } from "@/types";

interface OperationsFeedProps {
  orgId: string;
  initialAlerts: Alert[];
  resolvedAlerts: Alert[];
}

export function OperationsFeed({
  orgId,
  initialAlerts,
  resolvedAlerts,
}: OperationsFeedProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  // Subscribe to real-time alert changes
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`alerts-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAlerts((prev) => [payload.new as Alert, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAlerts((prev) =>
              prev
                .map((a) =>
                  a.id === payload.new.id ? (payload.new as Alert) : a
                )
                .filter((a) => a.status === "active")
            );
          } else if (payload.eventType === "DELETE") {
            setAlerts((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  const criticalAlerts = alerts.filter((a) => a.urgency >= 80);
  const highAlerts = alerts.filter((a) => a.urgency >= 60 && a.urgency < 80);
  const otherAlerts = alerts.filter((a) => a.urgency < 60);

  return (
    <div className="space-y-6">
      {/* Active alerts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Operations feed
          </h2>
          {alerts.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {alerts.length} active
            </span>
          )}
        </div>

        {alerts.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={24} />}
            title="All clear"
            description="No active alerts. Norva is monitoring your portfolio."
            className="py-10"
          />
        ) : (
          <div className="space-y-2">
            {/* Critical first */}
            {criticalAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                  Requires immediate attention
                </p>
                {criticalAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}

            {/* High urgency */}
            {highAlerts.length > 0 && (
              <div className="space-y-2">
                {criticalAlerts.length > 0 && (
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-amber-600">
                    Needs attention
                  </p>
                )}
                {highAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}

            {/* Other */}
            {otherAlerts.length > 0 && (
              <div className="space-y-2">
                {(criticalAlerts.length > 0 || highAlerts.length > 0) && (
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Monitoring
                  </p>
                )}
                {otherAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recently resolved */}
      {resolvedAlerts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <h2 className="text-sm font-medium text-gray-500">
              Handled in the last 24 hours
            </h2>
          </div>
          <div className="space-y-2 opacity-60">
            {resolvedAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} resolved />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

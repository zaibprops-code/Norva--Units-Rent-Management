// =============================================================================
// ALERT CARD — Client Component
// The primary UI element of the operations feed.
// Displays one alert with urgency indicator, context, and action buttons.
// =============================================================================
"use client";

import { useState } from "react";
import { CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

import { Badge, Button, Avatar } from "@/components/ui";
import { cn, formatAlertDate, formatCurrency, formatAlertType, getUrgencyLevel, URGENCY_CONFIG } from "@/lib/utils";
import type { Alert } from "@/types";

interface AlertCardProps {
  alert: Alert & {
    properties?: { id: string; name: string } | null;
    units?: { id: string; unit_number: string } | null;
    tenants?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
      phone: string | null;
      trs_score: number;
    } | null;
  };
  resolved?: boolean;
}

const URGENCY_BORDER: Record<string, string> = {
  critical: "alert-critical",
  high: "alert-high",
  medium: "alert-medium",
  low: "alert-low",
};

export function AlertCard({ alert, resolved = false }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);

  const urgencyLevel = getUrgencyLevel(alert.urgency);
  const urgencyConfig = URGENCY_CONFIG[urgencyLevel];

  async function handleResolve(note?: string) {
    setResolving(true);
    try {
      const response = await fetch(`/api/alerts/${alert.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution_note: note }),
      });

      if (!response.ok) throw new Error("Failed to resolve alert");
      toast.success("Alert resolved");
    } catch {
      toast.error("Failed to resolve alert");
      setResolving(false);
    }
  }

  async function handleDismiss() {
    setResolving(true);
    try {
      const response = await fetch(`/api/alerts/${alert.id}/dismiss`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to dismiss");
      toast.success("Alert dismissed");
    } catch {
      toast.error("Failed to dismiss");
      setResolving(false);
    }
  }

  const metadata = alert.metadata as Record<string, unknown>;

  return (
    <div
      className={cn(
        "card overflow-hidden transition-shadow hover:shadow-card-hover",
        resolved ? "alert-resolved" : URGENCY_BORDER[urgencyLevel]
      )}
    >
      <div className="px-4 py-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {/* Tenant avatar */}
            {alert.tenants && (
              <Avatar
                firstName={alert.tenants.first_name}
                lastName={alert.tenants.last_name}
                size="sm"
                className="mt-0.5 flex-shrink-0"
              />
            )}

            <div className="min-w-0 flex-1">
              {/* Title */}
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {alert.title}
              </p>

              {/* Metadata row */}
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                {alert.properties && (
                  <span className="text-xs text-gray-500">
                    {alert.properties.name}
                    {alert.units && ` · ${alert.units.unit_number}`}
                  </span>
                )}
                {alert.tenants && (
                  <span className="text-xs text-gray-400">
                    TRS {alert.tenants.trs_score}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {formatAlertDate(alert.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Right badges */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {!resolved && (
              <Badge
                variant={
                  urgencyLevel === "critical"
                    ? "red"
                    : urgencyLevel === "high"
                    ? "amber"
                    : urgencyLevel === "medium"
                    ? "blue"
                    : "gray"
                }
              >
                {urgencyConfig.label}
              </Badge>
            )}
            {resolved && (
              <Badge variant="green">
                <CheckCircle size={10} className="mr-1" />
                Resolved
              </Badge>
            )}
            <Badge variant="gray">{formatAlertType(alert.type)}</Badge>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Body text */}
        {alert.body && (
          <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-2">
            {alert.body}
          </p>
        )}

        {/* Recommended action */}
        {alert.recommended_action && !resolved && (
          <div className="mt-2 rounded-lg bg-navy-50 px-3 py-2">
            <p className="text-xs text-navy-700">
              <span className="font-medium">Recommendation: </span>
              {alert.recommended_action}
            </p>
          </div>
        )}

        {/* Action buttons — only for active alerts */}
        {!resolved && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={resolving}
              onClick={() => handleResolve("Approved and handled")}
            >
              Mark resolved
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
            >
              View details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={resolving}
              onClick={handleDismiss}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            {alert.tenants?.email && (
              <div>
                <p className="font-medium text-gray-500">Email</p>
                <p className="mt-0.5 text-gray-700">{alert.tenants.email}</p>
              </div>
            )}
            {alert.tenants?.phone && (
              <div>
                <p className="font-medium text-gray-500">Phone</p>
                <p className="mt-0.5 text-gray-700">{alert.tenants.phone}</p>
              </div>
            )}
            {typeof metadata?.amount === "number" && (
              <div>
                <p className="font-medium text-gray-500">Amount</p>
                <p className="mt-0.5 font-semibold text-gray-900">
                  {formatCurrency(metadata.amount as number)}
                </p>
              </div>
            )}
            {typeof metadata?.days_overdue === "number" && (
              <div>
                <p className="font-medium text-gray-500">Days overdue</p>
                <p className="mt-0.5 text-red-600 font-medium">
                  {metadata.days_overdue as number} days
                </p>
              </div>
            )}
            {typeof metadata?.escalation_level === "number" && (
              <div>
                <p className="font-medium text-gray-500">Escalation</p>
                <p className="mt-0.5 text-gray-700">
                  Level {metadata.escalation_level as number}
                </p>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-500">Alert ID</p>
              <p className="mt-0.5 font-mono text-gray-400">
                {alert.id.slice(0, 8)}…
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

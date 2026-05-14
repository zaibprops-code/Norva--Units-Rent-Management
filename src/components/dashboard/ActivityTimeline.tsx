// =============================================================================
// ACTIVITY TIMELINE
// Renders an append-only activity log as a vertical timeline.
// =============================================================================
import { formatRelative } from "@/lib/utils";
import type { ActivityLog } from "@/types";

interface ActivityTimelineProps {
  items: ActivityLog[];
  className?: string;
}

const ACTION_LABELS: Record<string, string> = {
  created: "Alert created",
  resolved: "Alert resolved",
  dismissed: "Alert dismissed",
  escalated: "Alert escalated",
  message_sent: "Message sent",
  payment_received: "Payment received",
  payment_failed: "Payment failed",
};

const ACTOR_DISPLAY: Record<string, string> = {
  norva: "Norva",
};

function dotColor(action: string): string {
  if (action.includes("resolved") || action.includes("received"))
    return "bg-green-400";
  if (action.includes("escalated") || action.includes("failed"))
    return "bg-red-400";
  if (action.includes("created")) return "bg-blue-400";
  return "bg-gray-300";
}

export function ActivityTimeline({
  items,
  className,
}: ActivityTimelineProps) {
  if (!items.length) {
    return (
      <p className="text-sm text-gray-400">No activity recorded yet.</p>
    );
  }

  return (
    <div className={className}>
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3 pb-4">
          {/* Dot + connector */}
          <div className="flex flex-col items-center">
            <div
              className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor(item.action)}`}
            />
            {idx < items.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-gray-200" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-1">
            <p className="text-xs leading-snug text-gray-700">
              <span className="font-medium">
                {ACTOR_DISPLAY[item.actor] ?? "You"}
              </span>{" "}
              {ACTION_LABELS[item.action] ?? item.action}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {formatRelative(item.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

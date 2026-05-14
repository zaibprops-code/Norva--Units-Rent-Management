// =============================================================================
// PORTFOLIO STATS BAR
// Shows top-level portfolio health metrics.
// =============================================================================
import { Building2, Users, AlertTriangle, Wrench } from "lucide-react";

import type { PortfolioStats as PortfolioStatsType } from "@/types";
import { formatPercent } from "@/lib/utils";

interface PortfolioStatsProps {
  stats: PortfolioStatsType;
}

export function PortfolioStats({ stats }: PortfolioStatsProps) {
  const cards = [
    {
      label: "Occupancy",
      value: formatPercent(stats.occupancyRate),
      sub: `${stats.occupiedUnits} of ${stats.totalUnits} units`,
      icon: Building2,
      color: stats.occupancyRate >= 90 ? "text-green-600" : "text-amber-600",
    },
    {
      label: "Active alerts",
      value: String(stats.activeAlerts),
      sub: stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : "No critical issues",
      icon: AlertTriangle,
      color: stats.criticalAlerts > 0 ? "text-red-600" : "text-gray-500",
    },
    {
      label: "Overdue rent",
      value: String(stats.overdueCount),
      sub: stats.overdueCount === 0 ? "All clear" : "units",
      icon: Users,
      color: stats.overdueCount > 0 ? "text-amber-600" : "text-green-600",
    },
    {
      label: "Open maintenance",
      value: String(stats.openMaintenanceCount),
      sub: "tickets open",
      icon: Wrench,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="card px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                {card.label}
              </span>
            </div>
            <p className={`text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

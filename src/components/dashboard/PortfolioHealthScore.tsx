// =============================================================================
// PORTFOLIO HEALTH SCORE — SVG ring gauge
// =============================================================================
import { cn } from "@/lib/utils";

interface PortfolioHealthScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE_MAP = { sm: 48, md: 64, lg: 80 } as const;

export function PortfolioHealthScore({
  score,
  size = "md",
  showLabel = false,
}: PortfolioHealthScoreProps) {
  const dim = SIZE_MAP[size];
  const strokeWidth = 5;
  const r = dim / 2 - strokeWidth - 1;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, score));
  const dash = (filled / 100) * circ;

  const ringColor =
    score >= 80
      ? "stroke-green-500"
      : score >= 60
      ? "stroke-amber-500"
      : "stroke-red-500";

  const textColor =
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-amber-600"
      : "text-red-600";

  const textSize =
    size === "sm"
      ? "text-xs"
      : size === "md"
      ? "text-base"
      : "text-xl";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dim}
          height={dim}
          className="-rotate-90"
          aria-label={`Health score: ${score}`}
        >
          {/* Track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            className={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("font-bold leading-none", textColor, textSize)}
          >
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500">Portfolio health</p>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { getTenantInitials } from "@/lib/utils/formatting";

// ============================================================================
// Avatar Component
// ============================================================================

type AvatarSize = "sm" | "md" | "lg";
type AvatarColor = "blue" | "amber" | "green" | "red" | "purple" | "gray";

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: AvatarSize;
  color?: AvatarColor;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

const colorClasses: Record<AvatarColor, string> = {
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

// Deterministic color based on name — same tenant always gets same color
function getAvatarColor(name: string): AvatarColor {
  const colors: AvatarColor[] = ["blue", "amber", "green", "purple", "gray"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index] ?? "blue";
}

export function Avatar({ firstName, lastName, size = "md", color, className }: AvatarProps) {
  const initials = getTenantInitials({ first_name: firstName, last_name: lastName });
  const avatarColor = color ?? getAvatarColor(firstName);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-medium",
        sizeClasses[size],
        colorClasses[avatarColor],
        className,
      )}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-gray-300">{icon}</div>
      )}
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================================
// Loading Spinner Component
// ============================================================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-gray-400", spinnerSizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ============================================================================
// Metric Card — for summary numbers in dashboard
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface-secondary p-4",
        className,
      )}
    >
      <p className="text-2xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {subtext && (
        <p className="mt-0.5 text-xs text-gray-500">{subtext}</p>
      )}
    </div>
  );
}

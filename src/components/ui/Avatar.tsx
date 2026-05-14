// =============================================================================
// AVATAR — Tenant/user initials avatar
// =============================================================================
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-green-100 text-green-700",
];

function getAvatarColor(name: string): string {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function Avatar({ firstName, lastName, size = "md", className }: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const colorClass = getAvatarColor(`${firstName}${lastName}`);

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full font-medium",
        SIZE_CLASSES[size],
        colorClass,
        className
      )}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}

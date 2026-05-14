import { cn } from "@/lib/utils";

// ============================================================================
// Card Components
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white",
        onClick && "cursor-pointer transition-shadow hover:shadow-card",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-gray-100 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={cn("px-4 py-3", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-gray-100 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

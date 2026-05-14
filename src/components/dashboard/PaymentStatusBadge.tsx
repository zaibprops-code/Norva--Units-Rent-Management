import { Badge } from "@/components/ui";

type PaymentStatus = "pending" | "paid" | "partial" | "failed" | "waived";

const CONFIG: Record<
  PaymentStatus,
  { variant: "green" | "red" | "amber" | "gray" | "blue"; label: string }
> = {
  paid: { variant: "green", label: "Paid" },
  pending: { variant: "gray", label: "Pending" },
  partial: { variant: "amber", label: "Partial" },
  failed: { variant: "red", label: "Failed" },
  waived: { variant: "blue", label: "Waived" },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { variant, label } = CONFIG[status] ?? {
    variant: "gray" as const,
    label: status,
  };
  return <Badge variant={variant}>{label}</Badge>;
}

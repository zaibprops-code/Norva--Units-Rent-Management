// =============================================================================
// NEW MAINTENANCE TICKET PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AddMaintenanceForm } from "@/components/maintenance/AddMaintenanceForm";

export const metadata: Metadata = { title: "Log Maintenance" };

export default function NewMaintenancePage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/dashboard/maintenance" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={14} /> Maintenance
      </Link>
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Log maintenance ticket</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manually log a maintenance issue or request.</p>
      </div>
      <AddMaintenanceForm />
    </div>
  );
}

// =============================================================================
// NEW TENANT PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AddTenantForm } from "@/components/tenants/AddTenantForm";

export const metadata: Metadata = { title: "Add Tenant" };

export default function NewTenantPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/dashboard/tenants" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={14} /> Tenants
      </Link>
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Add tenant</h1>
        <p className="mt-0.5 text-sm text-gray-500">Add a tenant and assign them to a unit.</p>
      </div>
      <AddTenantForm />
    </div>
  );
}

// =============================================================================
// NEW PROPERTY PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AddPropertyForm } from "@/components/properties/AddPropertyForm";

export const metadata: Metadata = { title: "Add Property" };

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/properties"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={14} />
          Properties
        </Link>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Add property</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Add a property to start tracking its units and tenants.
        </p>
      </div>
      <AddPropertyForm />
    </div>
  );
}

// =============================================================================
// ADD PROPERTY FORM — Client Component
// =============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function AddPropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    unit_count: "1",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not authenticated"); setLoading(false); return; }

    const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
    if (!org) { toast.error("Organization not found"); setLoading(false); return; }

    const { error } = await supabase.from("properties").insert({
      org_id: org.id,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zip: form.zip.trim() || null,
      unit_count: parseInt(form.unit_count) || 1,
      health_score: 100,
    });

    if (error) {
      toast.error("Failed to add property");
      console.error(error);
      setLoading(false);
      return;
    }

    toast.success("Property added");
    router.push("/dashboard/properties");
    router.refresh();
  }

  const fields: Array<{ name: keyof typeof form; label: string; placeholder: string; required?: boolean; type?: string }> = [
    { name: "name", label: "Property name", placeholder: "Cascade Lofts", required: true },
    { name: "address", label: "Street address", placeholder: "123 Main Street", required: true },
    { name: "city", label: "City", placeholder: "Austin" },
    { name: "state", label: "State", placeholder: "TX" },
    { name: "zip", label: "ZIP code", placeholder: "78701" },
    { name: "unit_count", label: "Number of units", placeholder: "1", type: "number" },
  ];

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      {fields.map(({ name, label, placeholder, required, type }) => (
        <div key={name}>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type ?? "text"}
            name={name}
            value={form[name]}
            onChange={handleChange}
            required={required}
            placeholder={placeholder}
            min={type === "number" ? 1 : undefined}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
          />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={loading}>Add property</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

// =============================================================================
// ADD TENANT FORM — Client Component
// =============================================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import type { Property, Unit } from "@/types";

export function AddTenantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    unit_id: "",
    rent_amount: "",
    lease_start: "",
    lease_end: "",
    rent_due_day: "1",
    grace_period_days: "3",
    payment_link: "",
  });

  useEffect(() => {
    async function loadProperties() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: org } = await supabase.from("organizations").select("id").eq("owner_id", user.id).single();
      if (!org) return;
      const { data } = await supabase.from("properties").select("*").eq("org_id", org.id).order("name");
      setProperties(data ?? []);
    }
    loadProperties();
  }, []);

  useEffect(() => {
    if (!selectedProperty) { setUnits([]); return; }
    async function loadUnits() {
      const supabase = createClient();
      const { data } = await supabase.from("units").select("*").eq("property_id", selectedProperty).order("unit_number");
      setUnits(data ?? []);
    }
    loadUnits();
  }, [selectedProperty]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        org_id: org.id,
        unit_id: form.unit_id || null,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        trs_score: 75,
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      toast.error("Failed to add tenant");
      setLoading(false);
      return;
    }

    // Create lease if unit is selected
    if (form.unit_id && form.rent_amount && form.lease_start && form.lease_end) {
      const { error: leaseError } = await supabase.from("leases").insert({
        org_id: org.id,
        unit_id: form.unit_id,
        tenant_id: tenant.id,
        rent_amount: parseFloat(form.rent_amount),
        lease_start: form.lease_start,
        lease_end: form.lease_end,
        rent_due_day: parseInt(form.rent_due_day) || 1,
        grace_period_days: parseInt(form.grace_period_days) || 3,
        payment_link: form.payment_link.trim() || null,
        status: "active",
      });

      if (leaseError) {
        toast.error("Tenant created but lease failed — add lease manually.");
      } else {
        // Update unit status
        await supabase.from("units").update({ status: "occupied" }).eq("id", form.unit_id);
      }
    }

    toast.success("Tenant added");
    router.push("/dashboard/tenants");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "first_name", label: "First name", placeholder: "Nathan", required: true },
          { name: "last_name", label: "Last name", placeholder: "Cross", required: true },
        ].map(({ name, label, placeholder, required }) => (
          <div key={name}>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
            <input type="text" name={name} value={form[name as keyof typeof form]} onChange={handleChange} required={required} placeholder={placeholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
          </div>
        ))}
      </div>

      {[
        { name: "email", label: "Email", placeholder: "tenant@example.com", type: "email" },
        { name: "phone", label: "Phone", placeholder: "(702) 555-0184", type: "tel" },
      ].map(({ name, label, placeholder, type }) => (
        <div key={name}>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">{label}</label>
          <input type={type} name={name} value={form[name as keyof typeof form]} onChange={handleChange} placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
        </div>
      ))}

      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Unit & lease (optional)</p>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Property</label>
            <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500">
              <option value="">Select property</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {selectedProperty && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Unit</label>
              <select name="unit_id" value={form.unit_id} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500">
                <option value="">Select unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.unit_number} ({u.status})</option>)}
              </select>
            </div>
          )}

          {form.unit_id && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Monthly rent ($)</label>
                  <input type="number" name="rent_amount" value={form.rent_amount} onChange={handleChange} placeholder="1500" min="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Due day of month</label>
                  <input type="number" name="rent_due_day" value={form.rent_due_day} onChange={handleChange} min="1" max="28"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Lease start</label>
                  <input type="date" name="lease_start" value={form.lease_start} onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Lease end</label>
                  <input type="date" name="lease_end" value={form.lease_end} onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Payment link (Venmo, Zelle, etc.)</label>
                <input type="url" name="payment_link" value={form.payment_link} onChange={handleChange} placeholder="https://venmo.com/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500" />
                <p className="mt-1 text-xs text-gray-400">Included in tenant reminder emails</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={loading}>Add tenant</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

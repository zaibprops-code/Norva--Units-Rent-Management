"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { classifyMaintenanceUrgency } from "@/lib/utils/urgency";
import type { Property, Unit } from "@/types";

const CATEGORIES = [
  "plumbing",
  "electrical",
  "hvac",
  "appliance",
  "structural",
  "pest",
  "other",
] as const;

type Category = (typeof CATEGORIES)[number];

export function AddMaintenanceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    property_id: "",
    unit_id: "",
    category: "" as Category | "",
    assigned_to: "",
    assigned_phone: "",
    scheduled_date: "",
  });

  // Load properties on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!org) return;
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("org_id", org.id)
        .order("name");
      setProperties(data ?? []);
    }
    load();
  }, []);

  // Load units when property changes
  useEffect(() => {
    if (!form.property_id) {
      setUnits([]);
      setForm((f) => ({ ...f, unit_id: "" }));
      return;
    }
    async function loadUnits() {
      const supabase = createClient();
      const { data } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", form.property_id)
        .order("unit_number");
      setUnits(data ?? []);
    }
    loadUnits();
  }, [form.property_id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.property_id || !form.unit_id) {
      toast.error("Select a property and unit");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    if (!org) {
      toast.error("Organization not found");
      setLoading(false);
      return;
    }

    const { urgency, urgencyScore } = classifyMaintenanceUrgency(
      form.title,
      form.description
    );

    const { data: ticket, error } = await supabase
      .from("maintenance_tickets")
      .insert({
        org_id: org.id,
        property_id: form.property_id,
        unit_id: form.unit_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: (form.category || null) as Category | null,
        urgency,
        urgency_score: urgencyScore,
        status: "open",
        assigned_to: form.assigned_to.trim() || null,
        assigned_phone: form.assigned_phone.trim() || null,
        scheduled_date: form.scheduled_date || null,
      })
      .select()
      .single();

    if (error || !ticket) {
      toast.error("Failed to create ticket");
      setLoading(false);
      return;
    }

    // Create alert for emergency / urgent tickets
    if (urgency === "emergency" || urgency === "urgent") {
      const unit = units.find((u) => u.id === form.unit_id);
      await supabase.from("alerts").insert({
        org_id: org.id,
        property_id: form.property_id,
        unit_id: form.unit_id,
        type: "maintenance_request",
        status: "active",
        urgency: urgencyScore,
        title: `${urgency === "emergency" ? "🚨 Emergency" : "⚠️ Urgent"} maintenance — ${unit?.unit_number ?? ""}`,
        body: form.title,
        recommended_action:
          urgency === "emergency"
            ? "Contact tenant immediately and dispatch emergency contractor."
            : "Schedule contractor within 24 hours.",
        escalation_level: urgency === "emergency" ? 2 : 1,
        metadata: { ticket_id: ticket.id, urgency },
      });
    }

    await supabase.from("activity_log").insert({
      org_id: org.id,
      entity_type: "maintenance",
      entity_id: ticket.id,
      action: "created",
      actor: user.id,
      metadata: { title: ticket.title, urgency },
    });

    toast.success(
      urgency === "emergency"
        ? "Emergency ticket created"
        : "Ticket logged"
    );
    router.push("/dashboard/maintenance");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500";

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g. Dripping faucet in bathroom"
          maxLength={200}
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Additional details about the issue…"
          maxLength={2000}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Property + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            Property <span className="text-red-500">*</span>
          </label>
          <select
            name="property_id"
            value={form.property_id}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            name="unit_id"
            value={form.unit_id}
            onChange={handleChange}
            required
            disabled={!form.property_id}
            className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.unit_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Contractor */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            Assigned contractor
          </label>
          <input
            type="text"
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            placeholder="Contractor name"
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-700">
            Contractor phone
          </label>
          <input
            type="tel"
            name="assigned_phone"
            value={form.assigned_phone}
            onChange={handleChange}
            placeholder="(702) 555-0100"
            maxLength={20}
            className={inputClass}
          />
        </div>
      </div>

      {/* Scheduled date */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-700">
          Scheduled date
        </label>
        <input
          type="datetime-local"
          name="scheduled_date"
          value={form.scheduled_date}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={loading}>
          Log ticket
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

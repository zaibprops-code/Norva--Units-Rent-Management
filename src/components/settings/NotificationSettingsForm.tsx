"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import type { Organization } from "@/types";

interface NotificationSettingsFormProps {
  org: Organization;
  userEmail: string;
}

export function NotificationSettingsForm({
  org,
  userEmail,
}: NotificationSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    notification_email: org.notification_email ?? userEmail,
    notification_phone: org.notification_phone ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        notification_email: form.notification_email.trim() || null,
        notification_phone: form.notification_phone.trim() || null,
      })
      .eq("id", org.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Notification settings saved");
    }
    setLoading(false);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Alert email */}
      <div className="card p-5 space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Alert delivery
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Alert email address
              </label>
              <input
                type="email"
                name="notification_email"
                value={form.notification_email}
                onChange={handleChange}
                placeholder={userEmail}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">
                Overdue rent alerts and daily digest are sent to this address.
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">
                  SMS number
                </label>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Coming in Phase 2
                </span>
              </div>
              <input
                type="tel"
                name="notification_phone"
                value={form.notification_phone}
                onChange={handleChange}
                placeholder="+1 (702) 555-0100"
                disabled
                className={`${inputClass} cursor-not-allowed bg-gray-50 text-gray-400`}
              />
              <p className="mt-1 text-xs text-gray-400">
                Emergency SMS alerts will be enabled in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Automated schedules (read-only info) */}
      <div className="card p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Automated schedule
        </h2>
        <div className="space-y-2.5">
          {[
            {
              label: "Lease expiry scanner",
              time: "6:00 AM daily",
              status: "Active",
            },
            {
              label: "Morning digest email",
              time: "6:30 AM daily",
              status: "Active",
            },
            {
              label: "Overdue rent check",
              time: "7:00 AM daily",
              status: "Active",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" variant="primary" loading={loading}>
        Save settings
      </Button>
    </form>
  );
}

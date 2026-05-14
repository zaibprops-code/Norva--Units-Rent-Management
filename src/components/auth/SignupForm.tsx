// =============================================================================
// SIGNUP FORM — Client Component
// Handles new account creation via Supabase Auth.
// Also creates the organization record via a server action.
// =============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          organization_name: formData.organizationName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Organization is created by a Supabase trigger (see migration 0001)
      // Redirect to dashboard — onboarding wizard will run there
      toast.success("Account created! Welcome to Norva.");
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="organizationName"
          className="mb-1.5 block text-xs font-medium text-white/70"
        >
          Company / portfolio name
        </label>
        <input
          id="organizationName"
          name="organizationName"
          type="text"
          value={formData.organizationName}
          onChange={handleChange}
          required
          placeholder="Cascade Properties LLC"
          className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-white/70"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-white/70"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account — free 14 days"}
      </button>

      <p className="text-center text-xs text-white/30">
        By signing up you agree to our Terms of Service.
      </p>
    </form>
  );
}

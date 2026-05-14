// =============================================================================
// SIGNUP PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your Norva account",
};

export default function SignupPage() {
  return (
    <div>
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon
              points="14,2 26,24 2,24"
              fill="none"
              stroke="#00c2a8"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="14" y1="2" x2="14" y2="24" stroke="#00c2a8" strokeWidth="1.5" opacity="0.5" />
            <line x1="2" y1="24" x2="20" y2="13" stroke="#00c2a8" strokeWidth="1" opacity="0.35" />
          </svg>
          <span className="text-xl font-semibold tracking-wide text-white">
            Norva
          </span>
        </div>
        <p className="text-sm text-navy-300">Start your 14-day free trial</p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <SignupForm />
      </div>

      {/* Sign in link */}
      <p className="mt-4 text-center text-sm text-navy-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-400 transition-colors hover:text-teal-300"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-navy-500">
        No credit card required.
      </p>
    </div>
  );
}

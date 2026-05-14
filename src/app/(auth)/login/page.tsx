// =============================================================================
// LOGIN PAGE
// =============================================================================
import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in to Norva",
};

export default function LoginPage() {
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
        <p className="text-sm text-navy-300">Sign in to your account</p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <LoginForm />
      </div>

      {/* Sign up link */}
      <p className="mt-4 text-center text-sm text-navy-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-teal-400 transition-colors hover:text-teal-300"
        >
          Start free trial
        </Link>
      </p>
    </div>
  );
}

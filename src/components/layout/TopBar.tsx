// =============================================================================
// TOP BAR — Client Component
// Shows page context, notifications, and user menu.
// =============================================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types";

interface TopBarProps {
  user: User;
  organization: Organization;
  onMenuClick: () => void;
}

export function TopBar({ user, organization, onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  }

  const userEmail = user.email ?? "";
  const initials = userEmail.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left — mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Norva wordmark — visible on mobile where sidebar is hidden */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="none" stroke="#00c2a8" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold text-navy-900">Norva</span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Notifications bell — placeholder for future */}
        <button
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
          title="Notifications coming soon"
        >
          <Bell size={18} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-teal-400">
              {initials}
            </div>
            <span className="hidden text-gray-700 sm:block">
              {userEmail.split("@")[0]}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              <div
                className={cn(
                  "absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200",
                  "bg-white py-1 shadow-card-hover"
                )}
              >
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="truncate text-xs font-medium text-gray-900">
                    {userEmail}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-gray-400">
                    {organization.plan} plan
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

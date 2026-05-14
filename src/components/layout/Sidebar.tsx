// =============================================================================
// SIDEBAR NAVIGATION — Client Component
// =============================================================================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wrench,
  Settings,
  X,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Organization } from "@/types";

const NAV_ITEMS = [
  {
    label: "Operations",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    icon: Building2,
    exact: false,
  },
  {
    label: "Tenants",
    href: "/dashboard/tenants",
    icon: Users,
    exact: false,
  },
  {
    label: "Maintenance",
    href: "/dashboard/maintenance",
    icon: Wrench,
    exact: false,
  },
] as const;

interface SidebarProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ organization, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-navy-950 transition-transform duration-200",
        "lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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
          <span className="text-base font-semibold tracking-wide text-white">
            Norva
          </span>
        </Link>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="rounded-md p-1 text-navy-400 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Organization name */}
      <div className="border-b border-white/5 px-4 pb-3">
        <p className="truncate text-xs text-navy-400">{organization.name}</p>
        <p className="mt-0.5 text-xs font-medium capitalize text-teal-400">
          {organization.plan} plan
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-navy-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                size={16}
                className={active ? "text-teal-400" : "text-current"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — settings */}
      <div className="border-t border-white/5 px-2 py-3 space-y-0.5">
        <Link
          href="/dashboard/settings/billing"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/dashboard/settings/billing")
              ? "bg-white/10 text-white"
              : "text-navy-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <CreditCard size={16} />
          Billing
        </Link>
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-white/10 text-white"
              : "text-navy-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}

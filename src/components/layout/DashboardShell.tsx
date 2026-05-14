// =============================================================================
// DASHBOARD SHELL — Client Component
// Wraps all dashboard pages with sidebar + top bar navigation.
// =============================================================================
"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { Organization } from "@/types";

interface DashboardShellProps {
  user: User;
  organization: Organization;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  organization,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        organization={organization}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar
          user={user}
          organization={organization}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

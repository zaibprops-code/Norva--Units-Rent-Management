"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle size={22} className="text-red-600" />
      </div>
      <h2 className="text-base font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        This section encountered an error.
        {error.digest && (
          <span className="ml-1 font-mono text-xs text-gray-400">
            ({error.digest})
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  );
}

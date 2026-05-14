"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In production you would send this to an error reporting service
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-7 w-7 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        An unexpected error occurred. If this keeps happening, contact{" "}
        <a
          href="mailto:support@norva.io"
          className="text-teal-700 underline hover:text-teal-900"
        >
          support@norva.io
        </a>
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-gray-400">
          Ref: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800"
      >
        Try again
      </button>
    </div>
  );
}

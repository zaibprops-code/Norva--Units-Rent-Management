// =============================================================================
// API RESPONSE HELPERS
// Consistent, typed Next.js Route Handler response factories.
// Import in /app/api/**/*.ts route files only.
// =============================================================================
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, details?: unknown): NextResponse {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(
  message = "Internal server error",
  err?: unknown
): NextResponse {
  if (err) console.error("[API]", message, err);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function validationError(
  errors: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    { error: "Validation failed", errors },
    { status: 422 }
  );
}

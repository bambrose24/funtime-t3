import type { NextFetchEvent, NextRequest } from "next/server";
import { updateSession } from "~/utils/supabase/middleware";
import { logger } from "./lib/axiom/logger";

// Simple request logging without the problematic Axiom transform
function logRequest(request: NextRequest) {
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";

  logger.info("Middleware request", {
    url,
    method,
    userAgent,
    ip,
    timestamp: new Date().toISOString(),
  });
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  logRequest(request);

  event.waitUntil(logger.flush());

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

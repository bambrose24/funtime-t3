/**
 * Shareable web routes and how mobile should handle them.
 * Keep this inventory exhaustive for play-funtime.com destinations users can share.
 * Native targets must map to an existing file under apps/mobile/app/.
 */
export const WEB_ORIGIN = "https://play-funtime.com";

export type ShareableRouteKind = "native" | "web_fallback";

export type ShareableRouteSpec = {
  /** Human-readable web path pattern for tests/docs. */
  webPattern: string;
  kind: ShareableRouteKind;
  /** Existing native route file when kind is native (documentation / tests). */
  nativeRouteFile?: string;
};

/**
 * Canonical shareable inventory. Tests assert every entry resolves.
 * Patterns use :id / :code / :memberId placeholders.
 */
export const SHAREABLE_WEB_ROUTES: readonly ShareableRouteSpec[] = [
  { webPattern: "/", kind: "native", nativeRouteFile: "app/(tabs)/home.tsx" },
  {
    webPattern: "/login",
    kind: "native",
    nativeRouteFile: "app/(auth)/auth.tsx",
  },
  {
    webPattern: "/signup",
    kind: "native",
    nativeRouteFile: "app/(auth)/signup.tsx",
  },
  {
    webPattern: "/forgot-password",
    kind: "native",
    nativeRouteFile: "app/(auth)/forgot-password.tsx",
  },
  {
    webPattern: "/confirm-reset-password",
    kind: "native",
    nativeRouteFile: "app/(auth)/confirm-reset-password.tsx",
  },
  {
    webPattern: "/confirm-signup",
    kind: "native",
    nativeRouteFile: "app/(auth)/confirm-signup.tsx",
  },
  {
    webPattern: "/auth/callback",
    kind: "native",
    nativeRouteFile: "app/auth/callback.tsx",
  },
  {
    webPattern: "/settings",
    kind: "native",
    nativeRouteFile: "app/(tabs)/account.tsx",
  },
  {
    webPattern: "/settings/profile",
    kind: "native",
    nativeRouteFile: "app/(tabs)/account.tsx",
  },
  {
    webPattern: "/settings/notifications",
    kind: "native",
    nativeRouteFile: "app/(tabs)/account.tsx",
  },
  { webPattern: "/admin", kind: "native", nativeRouteFile: "app/admin.tsx" },
  {
    webPattern: "/join-league",
    kind: "native",
    nativeRouteFile: "app/join-league/index.tsx",
  },
  {
    webPattern: "/join-league/:code",
    kind: "native",
    nativeRouteFile: "app/join-league/[code].tsx",
  },
  {
    webPattern: "/league/create",
    kind: "native",
    nativeRouteFile: "app/league/create.tsx",
  },
  {
    webPattern: "/league/:id",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/chat",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/info",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/leaderboard",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/pick",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/superbowl",
    kind: "native",
    nativeRouteFile: "app/league/[id]/index.tsx",
  },
  {
    webPattern: "/league/:id/player/:memberId",
    kind: "native",
    nativeRouteFile: "app/league/[id]/player/[memberId].tsx",
  },
  {
    webPattern: "/league/:id/admin",
    kind: "native",
    nativeRouteFile: "app/league/[id]/admin.tsx",
  },
  {
    webPattern: "/league/:id/admin/members",
    kind: "native",
    nativeRouteFile: "app/league/[id]/admin.tsx",
  },
  {
    webPattern: "/league/:id/renewal-invites",
    kind: "native",
    nativeRouteFile: "app/league/[id]/renewal-invites.tsx",
  },
  // Web-only commissioner/profile surfaces — open in browser until native exists.
  { webPattern: "/league/:id/my-profile", kind: "web_fallback" },
  { webPattern: "/league/:id/admin/superbowl", kind: "web_fallback" },
] as const;

export function webFallbackUrl(pathWithQuery: string): string {
  const normalized = pathWithQuery.startsWith("/")
    ? pathWithQuery
    : `/${pathWithQuery}`;
  return `${WEB_ORIGIN}${normalized}`;
}

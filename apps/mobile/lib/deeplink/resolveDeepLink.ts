import { webFallbackUrl } from "@/lib/deeplink/routeInventory";

const WEB_DEEP_LINK_HOSTS = new Set([
  "play-funtime.com",
  "www.play-funtime.com",
]);
const WEB_PROTOCOLS = new Set(["http", "https"]);
/** Expo Router dynamic segment keys that are already encoded in the pathname. */
const PATH_PARAM_KEYS = new Set(["id", "leagueId", "code", "memberId"]);

export type DeepLinkTarget = {
  href: string;
  mode: "push" | "replace";
  /** When true, `href` is a full https URL to open in the system browser. */
  openInBrowser?: boolean;
};

const normalizePath = (path?: string | null) => {
  const withoutLeadingSlash = (path ?? "").replace(/^\/+/, "");
  if (!withoutLeadingSlash) {
    return "/";
  }
  return `/${withoutLeadingSlash}`;
};

const withQueryString = (path: string, query: URLSearchParams) => {
  const queryString = query.toString();
  return queryString.length > 0 ? `${path}?${queryString}` : path;
};

const mergeSearchAndHashParams = (parsed: URL) => {
  const merged = new URLSearchParams(parsed.searchParams.toString());
  const hash = parsed.hash.replace(/^#/, "").replace(/^\?/, "");
  if (!hash) {
    return merged;
  }
  const hashParams = new URLSearchParams(hash);
  hashParams.forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
};

/** Stable href comparison that ignores query-param order. */
export function normalizeHref(href: string): string {
  const [rawPath = "/", rawQuery = ""] = href.split("?");
  const path =
    rawPath.length > 1 && rawPath.endsWith("/")
      ? rawPath.replace(/\/+$/, "")
      : rawPath || "/";
  if (!rawQuery) {
    return path;
  }
  const params = new URLSearchParams(rawQuery);
  const sorted = new URLSearchParams(
    [...params.entries()].sort((a, b) => {
      const keyCmp = a[0].localeCompare(b[0]);
      return keyCmp !== 0 ? keyCmp : a[1].localeCompare(b[1]);
    }),
  );
  return withQueryString(path, sorted);
}

/** True when navigation should run (path or query differs). */
export function shouldNavigate(currentHref: string, nextHref: string): boolean {
  return normalizeHref(currentHref) !== normalizeHref(nextHref);
}

/**
 * Build the current in-app href from pathname + search params, omitting
 * dynamic route segment keys that Expo also surfaces in search params.
 */
export function hrefFromPathAndParams(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (PATH_PARAM_KEYS.has(key) || value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    } else {
      query.set(key, value);
    }
  }
  return withQueryString(pathname || "/", query);
}

/**
 * Resolve a full URL or an in-app/notification path through the same allowlist.
 * Empty or unknown destinations return null (caller should not navigate).
 */
export function resolveAppDestination(raw: string): DeepLinkTarget | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      return resolveDeepLink(trimmed);
    }
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return resolveDeepLink(`https://play-funtime.com${path}`);
  } catch {
    return null;
  }
}

export function resolveDeepLink(url: string): DeepLinkTarget | null {
  const parsed = new URL(url);
  const protocol = parsed.protocol.replace(":", "").toLowerCase();
  const host = parsed.hostname.toLowerCase();
  const mergedParams = mergeSearchAndHashParams(parsed);

  let routePath = normalizePath(parsed.pathname);

  // Custom schemes like "funtime://auth/callback" encode route segment in hostname.
  if (!WEB_PROTOCOLS.has(protocol) && host) {
    routePath = normalizePath(`${host}${parsed.pathname}`);
  }

  // Expo dev URLs include "/--/" before the app route.
  routePath = routePath.replace(/^\/--\//, "/");

  if (WEB_DEEP_LINK_HOSTS.has(host) || !WEB_PROTOCOLS.has(protocol)) {
    if (routePath === "/settings" || routePath.startsWith("/settings/")) {
      return { href: "/account", mode: "replace" };
    }
    if (routePath === "/login") {
      return { href: withQueryString("/auth", mergedParams), mode: "replace" };
    }
  }

  if (routePath === "/auth/callback") {
    const code = mergedParams.get("code");
    const accessToken = mergedParams.get("access_token");
    const refreshToken = mergedParams.get("refresh_token");
    const type = mergedParams.get("type");
    const flow = mergedParams.get("flow");
    const next = mergedParams.get("next");
    const redirectTo = mergedParams.get("redirectTo");

    if (!code && !accessToken && !refreshToken && !type && !flow) {
      return null;
    }
    const query = new URLSearchParams();
    if (code) {
      query.set("code", code);
    }
    if (next) {
      query.set("next", next);
    }
    if (redirectTo) {
      query.set("redirectTo", redirectTo);
    }
    if (flow) {
      query.set("flow", flow);
    }
    if (type) {
      query.set("type", type);
    }
    if (accessToken) {
      query.set("access_token", accessToken);
    }
    if (refreshToken) {
      query.set("refresh_token", refreshToken);
    }
    const error = mergedParams.get("error");
    if (error) {
      query.set("error", error);
    }
    const errorCode = mergedParams.get("error_code");
    if (errorCode) {
      query.set("error_code", errorCode);
    }
    const errorDescription = mergedParams.get("error_description");
    if (errorDescription) {
      query.set("error_description", errorDescription);
    }

    if (
      !code &&
      !(accessToken && refreshToken) &&
      type !== "recovery" &&
      flow !== "recovery"
    ) {
      return null;
    }

    if (
      !query.has("flow") &&
      (query.get("type") === "recovery" ||
        (query.has("access_token") && query.has("refresh_token")))
    ) {
      query.set("flow", "recovery");
    }
    return {
      href: withQueryString("/auth/callback", query),
      mode: "replace",
    };
  }

  const leagueTabPathMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/(?<tab>chat|info|leaderboard|pick|superbowl)$/,
  );
  if (leagueTabPathMatch?.groups?.leagueId && leagueTabPathMatch.groups.tab) {
    const leagueId = leagueTabPathMatch.groups.leagueId;
    const tabMap: Record<string, string> = {
      chat: "messages",
      info: "info",
      leaderboard: "leaderboard",
      pick: "picks",
      superbowl: "superbowl",
    };
    const tabValue = tabMap[leagueTabPathMatch.groups.tab];
    if (tabValue) {
      const query = new URLSearchParams(mergedParams.toString());
      query.set("tab", tabValue);
      return {
        href: withQueryString(`/league/${leagueId}`, query),
        mode: "replace",
      };
    }
  }

  const leaguePlayerMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/player\/(?<memberId>\d+)$/,
  );
  if (leaguePlayerMatch?.groups?.leagueId && leaguePlayerMatch.groups.memberId) {
    return {
      href: withQueryString(
        `/league/${leaguePlayerMatch.groups.leagueId}/player/${leaguePlayerMatch.groups.memberId}`,
        mergedParams,
      ),
      mode: "replace",
    };
  }

  const leagueAdminMembersMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/admin\/members$/,
  );
  if (leagueAdminMembersMatch?.groups?.leagueId) {
    return {
      href: withQueryString(
        `/league/${leagueAdminMembersMatch.groups.leagueId}/admin`,
        mergedParams,
      ),
      mode: "replace",
    };
  }

  const leagueNativeSuffixMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/(?<suffix>admin|admin-picks|admin-emails|renewal-invites)$/,
  );
  if (
    leagueNativeSuffixMatch?.groups?.leagueId &&
    leagueNativeSuffixMatch.groups.suffix
  ) {
    return {
      href: withQueryString(
        `/league/${leagueNativeSuffixMatch.groups.leagueId}/${leagueNativeSuffixMatch.groups.suffix}`,
        mergedParams,
      ),
      mode: "replace",
    };
  }

  const leagueWebFallbackMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/(?:my-profile|admin\/superbowl)$/,
  );
  if (leagueWebFallbackMatch) {
    return {
      href: webFallbackUrl(withQueryString(routePath, mergedParams)),
      mode: "replace",
      openInBrowser: true,
    };
  }

  const leagueRootMatch = routePath.match(/^\/league\/(?<leagueId>\d+)$/);
  if (leagueRootMatch?.groups?.leagueId) {
    return {
      href: withQueryString(
        `/league/${leagueRootMatch.groups.leagueId}`,
        mergedParams,
      ),
      mode: "replace",
    };
  }

  const joinCodeMatch = routePath.match(/^\/join-league\/(?<code>[^/]+)$/);
  if (joinCodeMatch?.groups?.code) {
    return {
      href: withQueryString(
        `/join-league/${joinCodeMatch.groups.code}`,
        mergedParams,
      ),
      mode: "replace",
    };
  }

  const exactNativePaths = new Set([
    "/",
    "/join-league",
    "/league/create",
    "/auth",
    "/signup",
    "/forgot-password",
    "/confirm-reset-password",
    "/confirm-signup",
    "/account",
    "/admin",
  ]);

  if (exactNativePaths.has(routePath)) {
    if (routePath === "/") {
      return { href: "/home", mode: "replace" };
    }
    return {
      href: withQueryString(routePath, mergedParams),
      mode: "replace",
    };
  }

  // Do not accept arbitrary /league/... suffixes as native destinations.
  return null;
}

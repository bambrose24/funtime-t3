const WEB_DEEP_LINK_HOSTS = new Set(["play-funtime.com", "www.play-funtime.com"]);
const WEB_PROTOCOLS = new Set(["http", "https"]);

export type DeepLinkTarget = {
  href: string;
  mode: "push" | "replace";
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

  if (WEB_DEEP_LINK_HOSTS.has(host)) {
    if (routePath === "/settings") {
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

    if (!code && !(accessToken && refreshToken) && type !== "recovery" && flow !== "recovery") {
      return null;
    }

    if (!query.has("flow") && (query.get("type") === "recovery" || (query.has("access_token") && query.has("refresh_token")))) {
      query.set("flow", "recovery");
    }
    return {
      href: withQueryString("/auth/callback", query),
      mode: "replace",
    };
  }

  const leagueTabPathMatch = routePath.match(
    /^\/league\/(?<leagueId>\d+)\/(?<tab>info|leaderboard|pick|superbowl)$/,
  );
  if (leagueTabPathMatch?.groups?.leagueId && leagueTabPathMatch.groups.tab) {
    const leagueId = leagueTabPathMatch.groups.leagueId;
    const tabMap: Record<string, string> = {
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

  const routablePaths = [
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
  ];
  const prefixPaths = ["/join-league/", "/league/"];

  if (
    routablePaths.includes(routePath) ||
    prefixPaths.some((prefix) => routePath.startsWith(prefix))
  ) {
    if (routePath === "/") {
      return { href: "/home", mode: "replace" };
    }

    return {
      href: withQueryString(routePath, mergedParams),
      mode: "replace",
    };
  }

  return null;
}

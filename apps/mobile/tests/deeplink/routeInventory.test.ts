import { existsSync } from "node:fs";
import path from "node:path";
import {
  SHAREABLE_WEB_ROUTES,
  WEB_ORIGIN,
} from "@/lib/deeplink/routeInventory";
import { resolveDeepLink } from "@/lib/deeplink/resolveDeepLink";

const mobileRoot = path.resolve(__dirname, "../..");

function exampleUrl(webPattern: string): string {
  const filled = webPattern
    .replace(":id", "42")
    .replace(":memberId", "7")
    .replace(":code", "ABC123");
  return `${WEB_ORIGIN}${filled}`;
}

describe("shareable route inventory", () => {
  it("lists every shareable web route with a native file or web fallback", () => {
    expect(SHAREABLE_WEB_ROUTES.length).toBeGreaterThan(10);

    for (const route of SHAREABLE_WEB_ROUTES) {
      if (route.kind === "native") {
        expect(route.nativeRouteFile).toBeTruthy();
        expect(
          existsSync(path.join(mobileRoot, route.nativeRouteFile!)),
        ).toBe(true);
      } else {
        expect(route.nativeRouteFile).toBeUndefined();
      }
    }
  });

  it("resolves every inventory URL to a native target or browser fallback", () => {
    for (const route of SHAREABLE_WEB_ROUTES) {
      const url = exampleUrl(route.webPattern);
      const target = resolveDeepLink(
        route.webPattern === "/auth/callback"
          ? `${url}?code=test-code`
          : url,
      );
      expect(target).not.toBeNull();
      if (route.kind === "web_fallback") {
        expect(target?.openInBrowser).toBe(true);
        expect(target?.href.startsWith(WEB_ORIGIN)).toBe(true);
      } else {
        expect(target?.openInBrowser).toBeFalsy();
        expect(target?.href.startsWith("/")).toBe(true);
      }
    }
  });

  it("rejects unknown league suffixes instead of treating them as native routes", () => {
    expect(
      resolveDeepLink("https://play-funtime.com/league/42/not-a-real-page"),
    ).toBeNull();
    expect(
      resolveDeepLink("https://play-funtime.com/league/42/admin/unknown"),
    ).toBeNull();
  });
});

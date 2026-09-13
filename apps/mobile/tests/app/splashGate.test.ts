import { shouldHideSplash, SPLASH_TIMEOUT_MS } from "@/lib/app/splashGate";

describe("shouldHideSplash", () => {
  it("waits until fonts, cache, and session are ready", () => {
    expect(
      shouldHideSplash({
        fontsLoaded: false,
        cacheRestored: true,
        sessionResolved: true,
        timedOut: false,
      }),
    ).toBe(false);
    expect(
      shouldHideSplash({
        fontsLoaded: true,
        cacheRestored: false,
        sessionResolved: true,
        timedOut: false,
      }),
    ).toBe(false);
    expect(
      shouldHideSplash({
        fontsLoaded: true,
        cacheRestored: true,
        sessionResolved: false,
        timedOut: false,
      }),
    ).toBe(false);
    expect(
      shouldHideSplash({
        fontsLoaded: true,
        cacheRestored: true,
        sessionResolved: true,
        timedOut: false,
      }),
    ).toBe(true);
  });

  it("hides on timeout even if other gates are still pending", () => {
    expect(
      shouldHideSplash({
        fontsLoaded: false,
        cacheRestored: false,
        sessionResolved: false,
        timedOut: true,
      }),
    ).toBe(true);
  });

  it("exports a finite splash timeout", () => {
    expect(SPLASH_TIMEOUT_MS).toBeGreaterThan(0);
    expect(SPLASH_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
  });
});

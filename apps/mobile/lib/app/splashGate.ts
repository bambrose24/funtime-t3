/** Max time the native splash may stay up if restore/session stalls. */
export const SPLASH_TIMEOUT_MS = 8_000;

/**
 * Decide when the native splash can hide.
 * Timeout always wins so a failed/slow restore cannot blank the app forever.
 */
export function shouldHideSplash({
  fontsLoaded,
  cacheRestored,
  sessionResolved,
  timedOut,
}: {
  fontsLoaded: boolean;
  cacheRestored: boolean;
  sessionResolved: boolean;
  timedOut: boolean;
}): boolean {
  if (timedOut) {
    return true;
  }
  return fontsLoaded && cacheRestored && sessionResolved;
}

import { getPostHog } from "@/lib/posthog";
import { createComponentLogger } from "@/lib/logging";

const logger = createComponentLogger("CrashReporter");

export type CrashReportContext = {
  componentStack?: string | null;
  isFatal?: boolean;
  source?: "error_boundary" | "global_js" | "unhandled_rejection";
};

/**
 * PostHog-only crash reporting (MOB-12b known limitation vs Sentry).
 * Captures one structured event plus a local error log.
 */
export function reportCrash(
  error: unknown,
  context: CrashReportContext = {},
): void {
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown error");

  logger.error(err.message, {
    name: err.name,
    stack: err.stack?.slice(0, 2000),
    componentStack: context.componentStack?.slice(0, 2000),
    isFatal: context.isFatal ?? false,
    source: context.source ?? "error_boundary",
  });

  const posthog = getPostHog();
  posthog?.capture("mobile_crash", {
    message: err.message.slice(0, 500),
    name: err.name,
    stack: err.stack?.slice(0, 2000) ?? null,
    componentStack: context.componentStack?.slice(0, 2000) ?? null,
    isFatal: context.isFatal ?? false,
    source: context.source ?? "error_boundary",
  });
}

let globalHandlersInstalled = false;

/** Wire RN global JS error + unhandled rejection handlers once. */
export function installGlobalErrorHandlers(
  report: typeof reportCrash = reportCrash,
): void {
  if (globalHandlersInstalled) {
    return;
  }
  globalHandlersInstalled = true;

  const errorUtils = (
    globalThis as {
      ErrorUtils?: {
        getGlobalHandler?: () =>
          | ((error: Error, isFatal?: boolean) => void)
          | undefined;
        setGlobalHandler?: (
          handler: (error: Error, isFatal?: boolean) => void,
        ) => void;
      };
    }
  ).ErrorUtils;

  if (errorUtils?.setGlobalHandler) {
    const previous = errorUtils.getGlobalHandler?.();
    errorUtils.setGlobalHandler((error, isFatal) => {
      report(error, {
        isFatal: Boolean(isFatal),
        source: "global_js",
      });
      previous?.(error, isFatal);
    });
  }

  const tracking = (
    globalThis as {
      HermesInternal?: {
        enablePromiseRejectionTracker?: (
          tracker: (id: number, rejection: unknown) => void,
        ) => void;
      };
    }
  ).HermesInternal;

  if (typeof tracking?.enablePromiseRejectionTracker === "function") {
    tracking.enablePromiseRejectionTracker((_id, rejection) => {
      report(rejection, { source: "unhandled_rejection", isFatal: false });
    });
  }
}

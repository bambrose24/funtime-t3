"use client";
import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
import { createUseLogger, createWebVitalsComponent } from "@axiomhq/react";
import { nextJsFormatters } from "@axiomhq/nextjs/client";
import { axiomClient } from "./axiom";

const e2eModeEnabled = ["1", "true", "yes", "on"].includes(
  (process.env.NEXT_PUBLIC_E2E_MODE ?? "").toLowerCase(),
);
const axiomDataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;
const axiomEnabled = !e2eModeEnabled && Boolean(axiomClient) && Boolean(axiomDataset);

export const logger = new Logger({
  transports: axiomEnabled
    ? [
        new AxiomJSTransport({
          axiom: axiomClient!,
          dataset: axiomDataset!,
        }),
      ]
    : [new ConsoleTransport()],
  formatters: nextJsFormatters,
});

const useLogger = createUseLogger(logger);
const WebVitals = createWebVitalsComponent(logger);

export { useLogger, WebVitals };

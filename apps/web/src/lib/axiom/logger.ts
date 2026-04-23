import { AxiomJSTransport, ConsoleTransport, Logger } from "@axiomhq/logging";
import { createAxiomRouteHandler, nextJsFormatters } from "@axiomhq/nextjs";

import { axiomClient } from "./axiom";

const e2eModeEnabled = ["1", "true", "yes", "on"].includes(
  (process.env.E2E_MODE ?? process.env.NEXT_PUBLIC_E2E_MODE ?? "").toLowerCase(),
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

export const withAxiom = createAxiomRouteHandler(logger);

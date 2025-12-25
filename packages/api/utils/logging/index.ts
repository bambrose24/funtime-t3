import * as winston from "winston";
import { config, env } from "../config";
import { RequestContext } from "../requestContext";
import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";

const baseLogger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.json(),
  transports: [
    ...(config.logging.shouldLogToConsole
      ? [new winston.transports.Console()]
      : []),
    ...(config.logging.shouldLogToAxiom
      ? [
          new AxiomTransport({
            dataset: "funtime-t3-winston",
            token: process.env.AXIOM_TOKEN ?? "",
          }),
        ]
      : []),
  ],
});

type LoggerMeta = {
  userId: number | string;
  functionName?: string;
};

/**
 * To be used by the RequestContext setup. This should not be used by the rest of the app.
 *
 * If you want to do logging, use the {@link getLogger} function.
 */
export function createLogger(params: LoggerMeta) {
  return baseLogger.child(params);
}

/**
 * Use this function to get the logger that you want to use to log anything you want.
 *
 * Do this within the runtime of your function, not right at the top of a file.
 *
 * @example
 * ```typescript
 * async function run() {
 *   const thing = await getThing();
 *   getLogger().info('Got thing', { thing });
 *   return thing;
 * }
 * ```
 */
export function getLogger() {
  const l = RequestContext.get("logger");
  if (!l) {
    return console;
  }
  return l;
}

/**
 * If we're not in production then log to the `console` with the format:
 * `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
 */
if (env !== "production") {
  baseLogger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

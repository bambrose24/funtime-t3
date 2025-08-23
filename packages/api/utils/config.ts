/**
 * The running environment, mirrors the VERCEL_ENV variable that Vercel will set.
 */
type Env = "production" | "preview" | "development";

type Config = {
  logging: {
    shouldLogToConsole: boolean;
    shouldLogToAxiom: boolean;
    level: "debug" | "info" | "error";
  };
};

const configMap: Record<Env, Config> = {
  development: {
    logging: {
      shouldLogToConsole: true,
      shouldLogToAxiom: false,
      level: "info",
    },
  },
  preview: {
    logging: {
      shouldLogToConsole: true,
      shouldLogToAxiom: true,
      level: "info",
    },
  },
  production: {
    logging: {
      // TODO can we stop logging to console now that we are directly logging to axiom?
      shouldLogToConsole: true,
      shouldLogToAxiom: true,
      level: "info",
    },
  },
};

export const env = (process.env.NEXT_PUBLIC_FUNTIME_ENV ??
  process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT ??
  "development") as Env;
export const config = configMap[env];

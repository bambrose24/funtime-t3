/**
 * The running environment, mirrors the VERCEL_ENV variable that Vercel will set.
 */
type Env = "production" | "preview" | "development";

type Config = {
  logging: {
    shouldLogToConsole: boolean;
    shouldLogToAxiom: boolean;
  };
};

const configMap: Record<Env, Config> = {
  development: {
    logging: {
      shouldLogToConsole: true,
      shouldLogToAxiom: false,
    },
  },
  preview: {
    logging: {
      shouldLogToConsole: true,
      shouldLogToAxiom: true,
    },
  },
  production: {
    logging: {
      // TODO can we stop logging to console now that we are directly logging to axiom?
      shouldLogToConsole: true,
      shouldLogToAxiom: true,
    },
  },
};

export const env = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development") as Env;
export const config = configMap[env];

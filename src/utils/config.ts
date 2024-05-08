/**
 * The running environment, mirrors the VERCEL_ENV variable that Vercel will set.
 */
type Env = "production" | "preview" | "development";

type Config = {
  shouldLogToConsole: boolean;
};

const configMap: Record<Env, Config> = {
  development: {
    shouldLogToConsole: true,
  },
  preview: {
    shouldLogToConsole: true,
  },
  production: {
    // until we figure out how to send logs to Axiom, let's log to console in prod as well
    shouldLogToConsole: true,
  },
};

export const env = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development") as Env;
export const config = configMap[env];

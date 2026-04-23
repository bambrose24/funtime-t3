#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import dns from "node:dns/promises";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const apiDir = path.join(rootDir, "packages", "api");

const applyMigrations = process.argv.includes("--apply");

function parseEnvFile(filePath) {
  const env = {};
  if (!existsSync(filePath)) {
    return env;
  }

  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const idx = trimmed.indexOf("=");
    if (idx <= 0) {
      continue;
    }

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function resolveEnvFile() {
  const explicit = process.env.DOTENV_CONFIG_PATH;
  if (explicit) {
    const resolved = path.isAbsolute(explicit)
      ? explicit
      : path.resolve(rootDir, explicit);
    return resolved;
  }

  const localEnv = path.join(rootDir, ".env.local");
  if (existsSync(localEnv)) {
    return localEnv;
  }

  const apiEnv = path.join(apiDir, ".env");
  if (existsSync(apiEnv)) {
    return apiEnv;
  }

  const rootEnv = path.join(rootDir, ".env");
  return rootEnv;
}

function redactUrl(urlString) {
  try {
    const url = new URL(urlString);
    const dbName = url.pathname.replace(/^\//, "") || "(none)";
    const port = Number(url.port || "5432");
    return `${url.protocol}//${url.hostname}:${port}/${dbName}`;
  } catch {
    return "(invalid URL)";
  }
}

function hasPoolerHost(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.includes("pooler.supabase.com");
  } catch {
    return false;
  }
}

async function checkTcpConnectivity(urlString) {
  try {
    const url = new URL(urlString);
    const host = url.hostname;
    const port = Number(url.port || "5432");

    let dnsResult = "failed";
    try {
      await dns.lookup(host);
      dnsResult = "ok";
    } catch (error) {
      dnsResult = `failed (${error instanceof Error ? error.message : String(error)})`;
    }

    const tcpResult = await new Promise((resolve) => {
      const socket = net.connect({ host, port });
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve("failed (timeout)");
      }, 4000);

      socket.once("connect", () => {
        clearTimeout(timeout);
        socket.end();
        resolve("ok");
      });

      socket.once("error", (error) => {
        clearTimeout(timeout);
        resolve(`failed (${error.message})`);
      });
    });

    return { dnsResult, tcpResult };
  } catch (error) {
    return {
      dnsResult: "failed",
      tcpResult: `failed (${error instanceof Error ? error.message : String(error)})`,
    };
  }
}

function runPrisma(env, args) {
  return spawnSync(
    "pnpm",
    ["exec", "prisma", ...args, "--schema", "prisma/schema.prisma"],
    {
      cwd: apiDir,
      env,
      encoding: "utf8",
    },
  );
}

async function printDiagnostics(environment) {
  console.error("[prisma-check] Running diagnostics...");

  const targets = [
    ["DIRECT_URL", environment.DIRECT_URL],
    ["DATABASE_URL", environment.DATABASE_URL],
  ];

  for (const [name, value] of targets) {
    if (!value) {
      console.error(`[prisma-check] ${name}: not set`);
      continue;
    }

    const safeUrl = redactUrl(value);
    const connectivity = await checkTcpConnectivity(value);
    console.error(`[prisma-check] ${name}: ${safeUrl}`);
    console.error(`[prisma-check]   DNS lookup: ${connectivity.dnsResult}`);
    console.error(`[prisma-check]   TCP connect: ${connectivity.tcpResult}`);
  }

  const directUrl = environment.DIRECT_URL;
  if (directUrl && hasPoolerHost(directUrl)) {
    console.error(
      "[prisma-check] DIRECT_URL appears to target Supabase pooler host. Prisma migrate is more reliable with a direct DB host.",
    );
  }

  if (hasPoolerHost(environment.DATABASE_URL ?? "")) {
    console.error(
      "[prisma-check] DATABASE_URL targets Supabase pooler host. Keep pooler for app traffic, but set DIRECT_URL to direct host for migrations.",
    );
  }

  console.error(
    "[prisma-check] Tip: verify against local Supabase with DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55422/postgres DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:55422/postgres",
  );
}

async function main() {
  const envFile = resolveEnvFile();
  const fileEnv = parseEnvFile(envFile);
  const environment = { ...fileEnv, ...process.env };

  console.log("[prisma-check] Starting Prisma migration validation");
  console.log(`[prisma-check] Env file: ${envFile}${existsSync(envFile) ? "" : " (missing)"}`);
  console.log(
    `[prisma-check] DATABASE_URL: ${environment.DATABASE_URL ? redactUrl(environment.DATABASE_URL) : "(not set)"}`,
  );
  console.log(
    `[prisma-check] DIRECT_URL: ${environment.DIRECT_URL ? redactUrl(environment.DIRECT_URL) : "(not set)"}`,
  );

  const statusResult = runPrisma(environment, ["migrate", "status"]);
  if (statusResult.stdout) {
    process.stdout.write(statusResult.stdout);
  }
  if (statusResult.stderr) {
    process.stderr.write(statusResult.stderr);
  }

  if (statusResult.status !== 0) {
    await printDiagnostics(environment);
    process.exit(statusResult.status ?? 1);
  }

  if (!applyMigrations) {
    console.log("[prisma-check] Migration status succeeded. Skipping deploy (use --apply to run deploy).");
    return;
  }

  console.log("[prisma-check] Running prisma migrate deploy...");
  const deployResult = runPrisma(environment, ["migrate", "deploy"]);
  if (deployResult.stdout) {
    process.stdout.write(deployResult.stdout);
  }
  if (deployResult.stderr) {
    process.stderr.write(deployResult.stderr);
  }

  if (deployResult.status !== 0) {
    await printDiagnostics(environment);
    process.exit(deployResult.status ?? 1);
  }

  console.log("[prisma-check] Migration deploy succeeded.");
}

await main();

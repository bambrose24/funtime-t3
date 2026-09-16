import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const apiDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(apiDir, "../..");

const dotenvPath =
  process.env.DOTENV_CONFIG_PATH ?? path.join(repoRoot, ".env.local");
loadEnv({ path: dotenvPath, quiet: true });
loadEnv({ path: path.join(repoRoot, ".env"), quiet: true });

const placeholderUrl = "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
const shadowUrl =
  process.env.SHADOW_DATABASE_URL ?? process.env.PRISMA_SHADOW_DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI/migrate use the direct connection. Runtime PrismaClient uses DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? placeholderUrl,
    ...(shadowUrl ? { shadowDatabaseUrl: shadowUrl } : {}),
  },
});

#!/usr/bin/env node
import path from "node:path";
import { writeSeedSqlFromFixture } from "./lib.mjs";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const defaultFixturePath = path.join(repoRoot, "supabase", "fixtures", "season-2025.json");
const defaultOutputPath = path.join(repoRoot, "supabase", "seed.sql");

const fixturePathArg = process.argv[2];
const outputPathArg = process.argv[3];

const fixturePath = fixturePathArg
  ? path.resolve(process.cwd(), fixturePathArg)
  : defaultFixturePath;
const outputPath = outputPathArg
  ? path.resolve(process.cwd(), outputPathArg)
  : defaultOutputPath;

const result = writeSeedSqlFromFixture({ fixturePath, outputPath });

console.log(
  `[e2e] Generated seed SQL at ${result.outputPath} (${result.teamCount} teams, ${result.gameCount} games).`,
);

import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildPreview,
  parsePreviewArgs,
  previewScenarios,
} from "../../utils/weeklyRecapPreview";

test("preview defaults to the requested inbox", () => {
  expect(parsePreviewArgs([])).toEqual({
    to: "bambrose24@gmail.com",
    scenario: "tiebreaker",
    leagueId: 123,
    dryRun: false,
    help: false,
  });
});
test("custom recipient, scenario, and league link are configurable", () => {
  expect(
    parsePreviewArgs([
      "--to",
      "preview@example.com",
      "--scenario",
      "shared",
      "--league-id",
      "42",
      "--dry-run",
    ]),
  ).toMatchObject({
    to: "preview@example.com",
    scenario: "shared",
    leagueId: 42,
    dryRun: true,
  });
});
test("rejects malformed addresses, unknown options/scenarios, and missing values", () => {
  for (const args of [
    ["--to", "bad"],
    ["--to", "one@example.com,two@example.com"],
    ["--scenario", "wrong"],
    ["--league-id", "0"],
    ["--league-id", "1.5"],
    ["--to"],
    ["--to", "--dry-run"],
    ["--unknown"],
  ])
    expect(() => parsePreviewArgs(args)).toThrow();
});
test("default preview matches the approved example using calculated stats", () => {
  const preview = buildPreview("tiebreaker", "preview@example.com", 42);
  expect(preview.recipient).toMatchObject({
    username: "Brian",
    correctPicks: 10,
    rank: 4,
    tiebreakerDiff: 3,
    seasonRank: 3,
    seasonMovement: 1,
  });
  expect(preview.totalGames).toBe(16);
  expect(preview.totalMembers).toBe(12);
  expect(preview.winnerText).toBe("Alex wins Week 4 on the tiebreaker!");
});
test("all simulated scenarios produce the intended results", () => {
  expect(buildPreview("outright", "preview@example.com", 1).winnerText).toBe(
    "Alex wins Week 4 with 13 correct picks!",
  );
  expect(buildPreview("shared", "preview@example.com", 1).winnerText).toBe(
    "Alex and Jordan share the Week 4 win!",
  );
  expect(
    buildPreview("missing-picks", "preview@example.com", 1).recipient,
  ).toMatchObject({ correctPicks: 0, tiebreakerDiff: null });
  expect(buildPreview("final-week", "preview@example.com", 1)).toMatchObject({
    week: 18,
    nextWeek: null,
  });
});
const script = fileURLToPath(
  new URL("../../scripts/send-weekly-recap-preview.ts", import.meta.url),
);
test("all scenarios dry-run with no credentials and email disabled", () => {
  for (const scenario of previewScenarios) {
    const result = spawnSync(
      process.execPath,
      [script, "--dry-run", "--scenario", scenario],
      {
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          FUNTIME_DISABLE_EMAILS: "1",
          RESEND_API_KEY: "",
          E2E_MODE: "1",
        },
      },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Hi Brian");
    expect(result.stdout).not.toContain("Preview accepted");
  }
});
test("help does not require credentials", () => {
  expect(parsePreviewArgs(["--help"]).help).toBe(true);
  const result = spawnSync(process.execPath, [script, "--help"], {
    encoding: "utf8",
    env: { PATH: process.env.PATH, RESEND_API_KEY: "" },
  });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Usage:");
});
test("sending without credentials fails with actionable message", () => {
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      RESEND_API_KEY: "",
      FUNTIME_DISABLE_EMAILS: "0",
      E2E_MODE: "0",
    },
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("RESEND_API_KEY is required");
});
test("disabled email mode refuses to send", () => {
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      RESEND_API_KEY: "fake",
      FUNTIME_DISABLE_EMAILS: "true",
    },
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("Email sending is disabled");
});

import { expect, test } from "bun:test";
import { render } from "react-email";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readdirSync, existsSync } from "node:fs";
import {
  emailPreviews,
  parseEmailTestArgs,
  emailTestHelp,
} from "../../utils/emailPreview";
import { buildPreview } from "../../utils/weeklyRecapPreview";

const script = fileURLToPath(
  new URL("../../scripts/send-email-preview.ts", import.meta.url),
);
function run(args: string[], overrides: Record<string, string> = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      RESEND_API_KEY: "",
      E2E_MODE: "0",
      FUNTIME_DISABLE_EMAILS: "0",
      ...overrides,
    },
  });
}
test("no arguments lists types and preserves the requested default inbox", () => {
  expect(parseEmailTestArgs([])).toMatchObject({
    to: "bambrose24@gmail.com",
    list: true,
    all: false,
    type: undefined,
  });
  const result = run([]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Email ID");
  for (const id of Object.keys(emailPreviews))
    expect(result.stdout).toContain(id);
});
test("selects custom type, scenario, recipient, and league", () => {
  expect(
    parseEmailTestArgs([
      "--type",
      "week-summary",
      "--scenario",
      "shared",
      "--to",
      "preview@example.com",
      "--league-id",
      "42",
      "--dry-run",
    ]),
  ).toMatchObject({
    type: "week-summary",
    scenario: "shared",
    to: "preview@example.com",
    leagueId: 42,
    dryRun: true,
    list: false,
  });
});
test("validates arguments and rejects unsupported scenario/type combinations", () => {
  for (const args of [
    ["--to", "bad"],
    ["--to", "one@example.com,two@example.com"],
    ["--type", "unknown"],
    ["--type", "week-summary", "--scenario", "bad"],
    ["--type", "league-welcome", "--scenario", "shared"],
    ["--scenario", "shared"],
    ["--league-id", "0"],
    ["--league-id", "1.5"],
    ["--type"],
    ["--to", "--dry-run"],
    ["--unknown"],
    ["--all", "--type", "week-summary"],
  ])
    expect(() => parseEmailTestArgs(args)).toThrow();
});
test("every repo email template is registered (including development demo)", () => {
  const directory = fileURLToPath(new URL("../../emails/", import.meta.url));
  const templates = readdirSync(directory, { withFileTypes: true })
    .filter(
      (d) => d.isDirectory() && existsSync(`${directory}/${d.name}/index.tsx`),
    )
    .map((d) => d.name);
  templates.push("index");
  expect(
    [...new Set(Object.values(emailPreviews).map((d) => d.template))].sort(),
  ).toEqual(templates.sort());
});
for (const [id, definition] of Object.entries(emailPreviews)) {
  for (const scenario of definition.scenarios)
    test(`${id}/${scenario} renders HTML and plain text`, async () => {
      const preview = definition.build({
        to: "preview@example.com",
        leagueId: 42,
        scenario,
      });
      const html = await render(preview.element);
      const text = await render(preview.element, { plainText: true });
      expect(preview.subject.length).toBeGreaterThan(5);
      expect(html).toContain("<html");
      expect(text.length).toBeGreaterThan(10);
      expect(html).not.toContain("undefined");
      expect(text).not.toContain("NaN");
      if (id === "picks-confirmation" && scenario === "multiple-leagues")
        expect(html).toContain('href="https://www.play-funtime.com"');
      else if (id !== "component-demo" && id !== "renewal-invite")
        expect(html).toContain("/league/42");
    });
}
test("recap fixture retains the approved calculated stats", () => {
  expect(
    buildPreview("tiebreaker", "preview@example.com", 42).recipient,
  ).toMatchObject({
    username: "Brian",
    correctPicks: 10,
    rank: 4,
    tiebreakerDiff: 3,
    seasonRank: 3,
    seasonMovement: 1,
  });
});
test("renewal confirmation covers no invitees, one invitee, and multiple invitees", async () => {
  for (const [scenario, expected] of [
    ["no-invitees", "no player invitations were sent"],
    ["one-invitee", "1 player was"],
    ["invited-players", "11 players were"],
  ]) {
    const preview = emailPreviews["renewal-confirmation"].build({
      to: "preview@example.com",
      leagueId: 42,
      scenario: scenario!,
    });
    expect(await render(preview.element, { plainText: true })).toContain(
      expected!,
    );
  }
});
test("--all dry-runs every email once without credentials even when emails are disabled", () => {
  const result = run(["--all", "--dry-run"], {
    FUNTIME_DISABLE_EMAILS: "1",
    E2E_MODE: "1",
  });
  expect(result.status).toBe(0);
  for (const id of Object.keys(emailPreviews))
    expect(result.stdout).toContain(`[TEST] ${id}:`);
  expect(result.stdout).not.toContain("accepted by Resend");
});
test("single-type CLI renders selected scenario only", () => {
  const result = run([
    "--type",
    "week-summary",
    "--scenario",
    "shared",
    "--dry-run",
  ]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Alex and Jordan share");
  expect(result.stdout).not.toContain("[TEST] league-welcome:");
});
test("help enumerates types, scenarios, defaults, and bulk-send behavior", () => {
  expect(emailTestHelp()).toContain("8 emails");
  const result = run(["--help"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("bambrose24@gmail.com");
  expect(result.stdout).toContain("final-week");
});
test("sending requires credentials and respects email-disable switches", () => {
  const missing = run(["--type", "league-welcome"]);
  expect(missing.status).toBe(1);
  expect(missing.stderr).toContain("RESEND_API_KEY is required");
  for (const key of ["E2E_MODE", "FUNTIME_DISABLE_EMAILS"]) {
    const disabled = run(["--all"], { RESEND_API_KEY: "fake", [key]: "true" });
    expect(disabled.status).toBe(1);
    expect(disabled.stderr).toContain("Email sending is disabled");
  }
});

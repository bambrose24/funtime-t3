import type { ReactElement } from "react";
import { z } from "zod";
import Welcome from "../emails/league-welcome";
import Reminder from "../emails/picks-reminder";
import Confirmation from "../emails/picks-confirmation";
import Summary from "../emails/week-summary";
import Broadcast from "../emails/league-broadcast";
import Renewal from "../emails/league-renewal-invite";
import Demo from "../emails";
import {
  buildPreview,
  previewScenarios,
  type PreviewScenario,
} from "./weeklyRecapPreview";

type Context = { to: string; leagueId: number; scenario: string };
type Definition = {
  label: string;
  template: string;
  scenarios: readonly string[];
  build: (context: Context) => { subject: string; element: ReactElement };
};
const leagueName = "Sunday Crew (test data)";
const home = (id: number) => `https://www.play-funtime.com/league/${id}`;
const renewal = (c: Context, isInitiatorCopy: boolean) =>
  Renewal({
    adminName: "Alex",
    username: "Brian",
    priorLeagueName: leagueName,
    nextLeagueName: "Sunday Crew 2027 (test data)",
    season: 2027,
    isInitiatorCopy,
    recipientCount:
      c.scenario === "no-invitees" ? 0 : c.scenario === "one-invitee" ? 1 : 11,
    joinHref: isInitiatorCopy
      ? `${home(c.leagueId)}/admin`
      : "https://www.play-funtime.com/join-league/example-test-code",
  });

export const emailPreviews = {
  "league-welcome": {
    label: "League registration welcome",
    template: "league-welcome",
    scenarios: ["default"],
    build: (c: Context) => ({
      subject: `Welcome to ${leagueName}!`,
      element: Welcome({
        leagueName,
        username: "Brian",
        season: 2026,
        leagueHomeHref: home(c.leagueId),
        admin: { username: "Alex", email: "admin@example.com" },
      }),
    }),
  },
  "picks-reminder": {
    label: "Reminder to make picks",
    template: "picks-reminder",
    scenarios: ["default"],
    build: (c: Context) => ({
      subject: `Reminder: Make Your Picks for ${leagueName}!`,
      element: Reminder({
        username: "Brian",
        leagueName,
        leagueHomeHref: `${home(c.leagueId)}/pick`,
      }),
    }),
  },
  "picks-confirmation": {
    label: "Saved picks confirmation",
    template: "picks-confirmation",
    scenarios: ["single-league", "multiple-leagues"],
    build: (c: Context) => ({
      subject: "Your Funtime picks for Week 4!",
      element: Confirmation({
        username: "Brian",
        week: 4,
        leagues: [
          { name: leagueName, leagueId: c.leagueId },
          ...(c.scenario === "multiple-leagues"
            ? [{ name: "Office League (test data)", leagueId: c.leagueId + 1 }]
            : []),
        ],
        picks: [
          {
            homeTeam: "NE",
            awayTeam: "BUF",
            time: new Date("2026-10-04T17:00:00Z"),
            chosen: "home",
          },
          {
            homeTeam: "PHI",
            awayTeam: "DAL",
            time: new Date("2026-10-04T20:25:00Z"),
            chosen: "away",
          },
          {
            homeTeam: "KC",
            awayTeam: "BAL",
            time: new Date("2026-10-06T00:15:00Z"),
            chosen: "home",
            score: 45,
          },
        ],
      }),
    }),
  },
  "week-summary": {
    label: "Weekly results and season standing",
    template: "week-summary",
    scenarios: previewScenarios,
    build: (c: Context) => {
      const data = buildPreview(
        c.scenario as PreviewScenario,
        c.to,
        c.leagueId,
      );
      return {
        subject: `Sunday Crew · Your Week ${data.week} results`,
        element: Summary(data),
      };
    },
  },
  "league-broadcast": {
    label: "League admin message",
    template: "league-broadcast",
    scenarios: ["default"],
    build: (c: Context) => ({
      subject: `Funtime - Message from ${leagueName} Admin`,
      element: Broadcast({
        leagueName,
        leagueId: c.leagueId,
        adminName: "Alex",
        markdownMessage: `## Week 5 reminders\n\nThanks for playing! **Make your picks** before kickoff.\n\n- Check your saved picks\n- Add your tiebreaker prediction\n\n[Open your league](${home(c.leagueId)})\n\nThis message uses simulated test data.`,
      }),
    }),
  },
  "renewal-invite": {
    label: "Next-season invitation for players",
    template: "league-renewal-invite",
    scenarios: ["default"],
    build: (c: Context) => ({
      subject: "Next season: Sunday Crew 2027 is open",
      element: renewal(c, false),
    }),
  },
  "renewal-confirmation": {
    label: "Renewal confirmation for the organizer",
    template: "league-renewal-invite",
    scenarios: ["invited-players", "one-invitee", "no-invitees"],
    build: (c: Context) => ({
      subject: "Your copy: Sunday Crew 2027 is open",
      element: renewal(c, true),
    }),
  },
  "component-demo": {
    label: "Development button demo (not a production email)",
    template: "index",
    scenarios: ["default"],
    build: () => ({ subject: "Funtime email component demo", element: Demo() }),
  },
} satisfies Record<string, Definition>;
export type EmailPreviewId = keyof typeof emailPreviews;

export function parseEmailTestArgs(args: string[]) {
  let type: EmailPreviewId | undefined;
  let scenario: string | undefined;
  let to = "bambrose24@gmail.com";
  let leagueId = 123;
  let dryRun = false,
    all = false,
    list = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--all") all = true;
    else if (arg === "--list" || arg === "--help") list = true;
    else if (["--type", "--scenario", "--to", "--league-id"].includes(arg!)) {
      const value = args[++i];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${arg}`);
      if (arg === "--type") {
        if (!Object.hasOwn(emailPreviews, value))
          throw new Error("Unknown email type. Run pnpm email:test --list.");
        type = value as EmailPreviewId;
      }
      if (arg === "--scenario") scenario = value;
      if (arg === "--to") to = z.string().email().parse(value);
      if (arg === "--league-id")
        leagueId = z.coerce.number().int().positive().parse(value);
    } else
      throw new Error(`Unknown argument: ${arg}. Run pnpm email:test --help.`);
  }
  if (all && type) throw new Error("Choose --all or --type, not both.");
  if (scenario && !type) throw new Error("--scenario requires --type.");
  if (
    type &&
    scenario &&
    !(emailPreviews[type].scenarios as readonly string[]).includes(scenario)
  )
    throw new Error(
      `Invalid scenario for ${type}. Choose: ${emailPreviews[type].scenarios.join(", ")}`,
    );
  return {
    type,
    scenario,
    to,
    leagueId,
    dryRun,
    all,
    list: list || (!type && !all),
  };
}

export function emailTestHelp() {
  return `Usage: pnpm email:test --type <ID> [--scenario name] [--to email] [--league-id id] [--dry-run]
       pnpm email:test --all [--to email] [--dry-run]
       pnpm email:test --list

Email ID | Description | Scenarios (first is default)
${Object.entries(emailPreviews)
  .map(([id, d]) => `${id} | ${d.label} | ${d.scenarios.join(", ")}`)
  .join("\n")}

Default recipient: bambrose24@gmail.com. League 123 is a placeholder.
--all sends one default preview per ID (${Object.keys(emailPreviews).length} emails). --dry-run sends nothing.
Requires RESEND_API_KEY to send. Uses simulated data; no database reads or writes.
Renewal invite URLs use a nonfunctional example code. Provider-managed authentication emails are outside this template catalog.`;
}

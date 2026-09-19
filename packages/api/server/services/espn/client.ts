import { z } from "zod";
import { isE2EMode } from "../../../utils/e2e";
import {
  POSTSEASON_WEEKS,
  REGULAR_SEASON_WEEK_COUNT,
  postseasonWeekScoreboardUrl,
  regularSeasonWeekScoreboardUrl,
} from "./scoreboardUrls";
import { fetchEspnResponse } from "./transport.mjs";

export class ESPNResponseError extends Error {
  constructor({
    url,
    status,
    statusText,
    contentType,
    bodyPreview,
  }: {
    url: string;
    status: number;
    statusText: string;
    contentType: string | null;
    bodyPreview: string;
  }) {
    super(
      `ESPN returned an invalid response for ${url}: ${status} ${statusText}; content-type=${contentType ?? "(missing)"}; body=${JSON.stringify(bodyPreview)}`,
    );
    this.name = "ESPNResponseError";
  }
}

async function fetchEspnJson(url: string): Promise<unknown> {
  const response = await fetchEspnResponse(url);
  const contentType = response.headers.get("content-type");
  const body = await response.text();
  const bodyPreview = body.slice(0, 500);

  if (!response.ok || !contentType?.includes("application/json")) {
    throw new ESPNResponseError({
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyPreview,
    });
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ESPNResponseError({
      url,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyPreview,
    });
  }
}

const LeagueSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  slug: z.string(),
  season: z.object({
    year: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    displayName: z.string(),
    type: z.object({
      id: z.string(),
      type: z.number(),
      name: z.string(),
      abbreviation: z.string(),
    }),
  }),
});

const StatusSchema = z.enum([
  "STATUS_SCHEDULED",
  "STATUS_IN_PROGRESS",
  "STATUS_FINAL",
  "STATUS_HALFTIME",
  "STATUS_END_PERIOD",
  "STATUS_POSTPONED",
  "STATUS_CANCELED",
  "STATUS_SUSPENDED",
  "STATUS_DELAYED",
]);

const TeamSchema = z.object({
  id: z.string(),
  uid: z.string(),
  location: z.string(),
  name: z.string().optional(),
  abbreviation: z.string(),
  displayName: z.string(),
  shortDisplayName: z.string(),
  color: z.string().optional(),
  alternateColor: z.string().optional(),
  isActive: z.boolean(),
});

const CompetitorSchema = z.object({
  id: z.string(),
  uid: z.string(),
  type: z.string(),
  order: z.number(),
  homeAway: z.enum(["home", "away"]),
  winner: z.boolean().optional(),
  team: TeamSchema,
  score: z.string().optional(),
});

const CompetitionSchema = z.object({
  id: z.string(),
  uid: z.string(),
  date: z.string(),
  attendance: z.number().optional(),
  type: z.object({
    id: z.string(),
    abbreviation: z.string(),
  }),
  timeValid: z.boolean(),
  neutralSite: z.boolean(),
  conferenceCompetition: z.boolean(),
  playByPlayAvailable: z.boolean(),
  recent: z.boolean(),
  venue: z
    .object({
      id: z.string(),
      fullName: z.string(),
      address: z.object({
        city: z.string(),
        state: z.string().optional(),
      }),
    })
    .optional(),
  competitors: z.array(CompetitorSchema),
  status: z.object({
    clock: z.number(),
    displayClock: z.string(),
    period: z.number(),
    type: z.object({
      id: z.string(),
      name: StatusSchema,
      state: z.string(),
      completed: z.boolean(),
      description: z.string(),
      detail: z.string(),
      shortDetail: z.string(),
    }),
  }),
});

const EventSchema = z.object({
  id: z.string(),
  uid: z.string(),
  date: z.string(),
  name: z.string(),
  shortName: z.string(),
  season: z.object({
    year: z.number(),
    type: z.number(), // 1 = preseason, 2 = regular season, 3 = postseason
    slug: z.string(),
  }),
  week: z.object({
    number: z.number(),
  }),
  competitions: z.array(CompetitionSchema),
  status: z.object({
    clock: z.number(),
    displayClock: z.string(),
    period: z.number(),
    type: z.object({
      id: z.string(),
      name: StatusSchema,
      state: z.string(),
      completed: z.boolean(),
      description: z.string(),
      detail: z.string(),
      shortDetail: z.string(),
    }),
  }),
});

const EventsResponseSchema = z.object({
  leagues: z.array(LeagueSchema).optional(),
  season: z
    .object({
      type: z.number(),
      year: z.number(),
    })
    .optional(),
  week: z
    .object({
      number: z.number(),
    })
    .optional(),
  events: z.array(EventSchema),
});

type ESPNEvent = z.infer<typeof EventSchema>;
type EspnJsonFetcher = (url: string) => Promise<unknown>;

// Map ESPN playoff week numbers to our round enum
const PLAYOFF_WEEK_TO_ROUND = {
  1: "wild_card",
  2: "divisional",
  3: "conference",
  // Week 4 is Pro Bowl, skip it
  5: "super_bowl",
} as const;

export type PostseasonRound = "wild_card" | "divisional" | "conference" | "super_bowl";

function appendUniqueEvents(
  events: ESPNEvent[],
  seenIds: Set<string>,
  incoming: ESPNEvent[],
) {
  for (const event of incoming) {
    if (seenIds.has(event.id)) continue;
    seenIds.add(event.id);
    events.push(event);
  }
}

export class ESPNClient {
  private readonly fetchJson: EspnJsonFetcher;

  constructor(fetchJson: EspnJsonFetcher = fetchEspnJson) {
    this.fetchJson = fetchJson;
  }

  private skipExternalEspn() {
    // E2E_MODE blocks live ESPN. Injected fetchers are for tests and must run
    // even when sibling unit tests set E2E_MODE in the same process.
    return isE2EMode && this.fetchJson === fetchEspnJson;
  }

  async getGamesBySeason({ season }: { season: number }): Promise<ESPNEvent[]> {
    if (this.skipExternalEspn()) {
      return [];
    }
    // ESPN rejects multi-day `dates=` scoreboard queries with HTTP 400.
    // Week + season still works, so assemble the season from weeks 1-18.
    const events: ESPNEvent[] = [];
    const seenIds = new Set<string>();
    for (let week = 1; week <= REGULAR_SEASON_WEEK_COUNT; week++) {
      appendUniqueEvents(
        events,
        seenIds,
        await this.getGamesByWeek({ season, week }),
      );
    }
    return events;
  }

  async getGamesByWeek({
    season,
    week,
  }: {
    season: number;
    week: number;
  }): Promise<ESPNEvent[]> {
    if (this.skipExternalEspn()) {
      return [];
    }
    const url = regularSeasonWeekScoreboardUrl(season, week);
    const parsedData = EventsResponseSchema.parse(await this.fetchJson(url));
    return parsedData.events;
  }

  /**
   * Fetches postseason games for a given season.
   * Playoffs occur in January-February of the year following the season.
   * e.g., 2024 season playoffs are in January-February 2025.
   */
  async getPostseasonGames({ season }: { season: number }): Promise<ESPNEvent[]> {
    if (this.skipExternalEspn()) {
      return [];
    }
    const events: ESPNEvent[] = [];
    const seenIds = new Set<string>();
    for (const week of POSTSEASON_WEEKS) {
      const url = postseasonWeekScoreboardUrl(season, week);
      const parsedData = EventsResponseSchema.parse(await this.fetchJson(url));
      appendUniqueEvents(
        events,
        seenIds,
        parsedData.events.filter(
          (event) => event.season.type === 3 && event.week.number !== 4,
        ),
      );
    }
    return events;
  }

  /**
   * Maps an ESPN playoff week number to our PostseasonRound enum
   */
  getPostseasonRound(weekNumber: number): PostseasonRound | null {
    return PLAYOFF_WEEK_TO_ROUND[weekNumber as keyof typeof PLAYOFF_WEEK_TO_ROUND] ?? null;
  }

  /**
   * Determines the conference based on the teams playing.
   * Returns null for Super Bowl (mixed conferences).
   */
  getGameConference(
    homeTeamConference: string | null | undefined,
    awayTeamConference: string | null | undefined
  ): "AFC" | "NFC" | null {
    // If both teams are from the same conference, return that conference
    if (homeTeamConference === awayTeamConference) {
      if (homeTeamConference === "AFC" || homeTeamConference === "NFC") {
        return homeTeamConference;
      }
    }
    // Mixed conferences = Super Bowl
    return null;
  }

  translateAbbreviation(abbrev: string) {
    switch (abbrev) {
      case "LAR":
        return "LA";
      case "WSH":
        return "WAS";
      default:
        return abbrev;
    }
  }

  /**
   * Fetches playoff seeding for a given season.
   * Returns teams with their conference and playoff seed (1-7).
   */
  async getPlayoffSeedings({ season }: { season: number }): Promise<{
    conference: "AFC" | "NFC";
    teamAbbrev: string;
    teamId: string;
    teamName: string;
    seed: number;
  }[]> {
    if (isE2EMode) {
      return [];
    }
    const url = `https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=${season}`;
    const response = await fetchEspnResponse(url);
    const data = (await response.json()) as {
      children?: Array<{
        abbreviation: string;
        standings?: {
          entries?: Array<{
            team?: {
              id: string;
              abbreviation: string;
              displayName: string;
            };
            stats?: Array<{
              name: string;
              value: number;
            }>;
          }>;
        };
      }>;
    };

    const seedings: {
      conference: "AFC" | "NFC";
      teamAbbrev: string;
      teamId: string;
      teamName: string;
      seed: number;
    }[] = [];

    for (const conf of data.children ?? []) {
      const conference = conf.abbreviation as "AFC" | "NFC";
      if (conference !== "AFC" && conference !== "NFC") continue;

      for (const entry of conf.standings?.entries ?? []) {
        const team = entry.team;
        if (!team) continue;

        const seedStat = entry.stats?.find((s) => s.name === "playoffSeed");
        const seed = seedStat?.value;

        // Only include playoff teams (seeds 1-7)
        if (seed && seed >= 1 && seed <= 7) {
          seedings.push({
            conference,
            teamAbbrev: this.translateAbbreviation(team.abbreviation),
            teamId: team.id,
            teamName: team.displayName,
            seed: Math.round(seed),
          });
        }
      }
    }

    return seedings;
  }
}

export const espnClient = new ESPNClient();

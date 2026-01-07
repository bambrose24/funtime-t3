import { z } from "zod";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";

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

// Map ESPN playoff week numbers to our round enum
const PLAYOFF_WEEK_TO_ROUND = {
  1: "wild_card",
  2: "divisional",
  3: "conference",
  // Week 4 is Pro Bowl, skip it
  5: "super_bowl",
} as const;

export type PostseasonRound = "wild_card" | "divisional" | "conference" | "super_bowl";

export class ESPNClient {
  async getGamesBySeason({ season }: { season: number }): Promise<ESPNEvent[]> {
    const startDate = `${season}0901`; // September 1st of the season year
    const endDate = `${season + 1}0301`; // March 1st of the following year
    const url = `${BASE_URL}/scoreboard?limit=1000&dates=${startDate}-${endDate}&seasontype=2`;
    const response = await fetch(url);
    const data = (await response.json()) as unknown;
    const parsedData = EventsResponseSchema.parse(data);
    return parsedData.events;
  }

  async getGamesByWeek({
    season,
    week,
  }: {
    season: number;
    week: number;
  }): Promise<ESPNEvent[]> {
    const url = `${BASE_URL}/scoreboard?limit=100&seasontype=2&week=${week}&season=${season}`;
    const response = await fetch(url);
    const data = (await response.json()) as unknown;
    const parsedData = EventsResponseSchema.parse(data);
    return parsedData.events;
  }

  /**
   * Fetches postseason games for a given season.
   * Playoffs occur in January-February of the year following the season.
   * e.g., 2024 season playoffs are in January-February 2025.
   */
  async getPostseasonGames({ season }: { season: number }): Promise<ESPNEvent[]> {
    // Playoffs start in January of the following year
    const startDate = `${season + 1}0101`; // January 1st
    const endDate = `${season + 1}0220`; // February 20th (after Super Bowl)
    const url = `${BASE_URL}/scoreboard?limit=100&dates=${startDate}-${endDate}`;
    const response = await fetch(url);
    const data = (await response.json()) as unknown;
    const parsedData = EventsResponseSchema.parse(data);
    
    // Filter to only postseason games (season.type === 3) and exclude Pro Bowl (week 4)
    return parsedData.events.filter(
      (event) => 
        event.season.type === 3 && 
        event.week.number !== 4 // Exclude Pro Bowl
    );
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
    const url = `https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=${season}`;
    const response = await fetch(url);
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

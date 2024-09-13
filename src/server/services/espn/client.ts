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
  'STATUS_SCHEDULED',
  'STATUS_IN_PROGRESS',
  'STATUS_FINAL',
  'STATUS_POSTPONED',
  'STATUS_CANCELED',
  'STATUS_SUSPENDED',
  'STATUS_DELAYED',
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
  venue: z.object({
    id: z.string(),
    fullName: z.string(),
    address: z.object({
      city: z.string(),
      state: z.string().optional(),
    }),
  }).optional(),
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
    type: z.number(),
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
  season: z.object({
    type: z.number(),
    year: z.number(),
  }).optional(),
  week: z.object({
    number: z.number(),
  }).optional(),
  events: z.array(EventSchema),
});

type ESPNEvent = z.infer<typeof EventSchema>;

export class ESPNClient {
  async getGamesBySeason({ season }: { season: number }): Promise<ESPNEvent[]> {
    const startDate = `${season}0901`;  // September 1st of the season year
    const endDate = `${season + 1}0301`;  // March 1st of the following year
    const url = `${BASE_URL}/scoreboard?limit=1000&dates=${startDate}-${endDate}&seasontype=2`;
    const response = await fetch(url);
    const data = await response.json() as unknown;
    const parsedData = EventsResponseSchema.parse(data);
    return parsedData.events;
  }

  async getGamesByWeek({ season, week }: { season: number, week: number }): Promise<ESPNEvent[]> {
    const url = `${BASE_URL}/scoreboard?limit=100&seasontype=2&week=${week}&season=${season}`;
    const response = await fetch(url);
    const data = await response.json() as unknown;
    const parsedData = EventsResponseSchema.parse(data);
    return parsedData.events;
  }

  translateAbbreviation(abbrev: string) {
    switch (abbrev) {
      case 'LAR':
        return 'LA';
      case 'WSH':
        return 'WAS';
      default:
        return abbrev;
    }
  }
}

export const espnClient = new ESPNClient();

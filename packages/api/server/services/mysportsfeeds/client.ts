import { z } from "zod";
import { getLogger } from "../../../utils/logging";
import { MSFGameSchema } from "./types";

type MSFGame = z.infer<typeof MSFGameSchema>;

type WeekSeasonOptions = { week: number; season: number };
type SeasonOptions = { season: number };

function gamesURL({ week, season }: WeekSeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-${
    season + 1
  }-regular/week/${week}/games.json`;
}

function seasonURL({ season }: SeasonOptions) {
  return `https://api.mysportsfeeds.com/v2.1/pull/nfl/${season}-regular/games.json`;
}

const API_PASSWORD = "MYSPORTSFEEDS";

const gamesResponseSchema = z.object({ games: z.array(MSFGameSchema) });

export class MSFClient {
  key: string;
  constructor(key: string) {
    this.key = key;
  }

  headers() {
    const base64Key = Buffer.from(`${this.key}:${API_PASSWORD}`).toString(
      "base64",
    );

    return {
      Authorization: `Basic ${base64Key}`,
    };
  }

  async getGamesByWeek({
    week,
    season,
  }: WeekSeasonOptions): Promise<Array<MSFGame>> {
    getLogger().info(`Fetching games by week ${week} ${season}`);
    const res = await fetch(gamesURL({ week, season }), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const games = gamesResponseSchema.safeParse(await res.json());
    return games.success ? games.data.games : [];
  }

  async getGamesBySeason({ season }: SeasonOptions): Promise<Array<MSFGame>> {
    getLogger().info(`Fetching games by season ${season}`);
    const res = await fetch(seasonURL({ season }), {
      headers: new Headers({
        ...this.headers(),
      }),
    });

    const games = gamesResponseSchema.safeParse(await res.json());
    if (!games.success) {
      console.error(`Error parsing MSF games ${games.error.message}`);
    }
    return games.success ? games.data.games : [];
  }
}

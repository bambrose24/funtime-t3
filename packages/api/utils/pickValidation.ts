import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const TIEBREAKER_SCORE_MIN = 1;
export const TIEBREAKER_SCORE_MAX = 200;

export const pickScoreSchema = z
  .number()
  .int()
  .min(TIEBREAKER_SCORE_MIN)
  .max(TIEBREAKER_SCORE_MAX);

/** Form-string check matching pickScoreSchema (inclusive 1–200 integers). */
export function isValidTiebreakerScoreInput(val: string): boolean {
  const score = Number(val);
  return (
    !Number.isNaN(score) &&
    Number.isInteger(score) &&
    score >= TIEBREAKER_SCORE_MIN &&
    score <= TIEBREAKER_SCORE_MAX
  );
}

/** Validate against authoritative schedule data before either writer saves. */
export function validatePickGame(
  pick: { gid: number; winner: number; score?: number },
  game:
    | {
        gid: number;
        season: number;
        home: number;
        away: number;
        is_tiebreaker: boolean | null;
      }
    | undefined,
  leagueSeasons: readonly number[],
) {
  const reject = (message: string): never => {
    throw new TRPCError({ code: "BAD_REQUEST", message });
  };
  if (!game) return reject(`Game ${pick.gid} does not exist`);
  if (leagueSeasons.some((season) => season !== game.season)) {
    reject(
      `Game ${pick.gid} does not belong to every requested league's season`,
    );
  }
  if (pick.winner !== game.home && pick.winner !== game.away) {
    reject(`Could not find team ${pick.winner} for game ${pick.gid}`);
  }
  if (pick.score !== undefined && !game.is_tiebreaker) {
    reject(`Game ${pick.gid} is not a tiebreaker game`);
  }
}

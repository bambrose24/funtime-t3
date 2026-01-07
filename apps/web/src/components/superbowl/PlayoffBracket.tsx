"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/types";
import { TeamLogo } from "../shared/TeamLogo";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Text } from "../ui/text";

type Team = RouterOutputs["teams"]["getTeams"][number];
type PostseasonGame =
  RouterOutputs["postseason"]["getBracket"]["wild_card"]["AFC"][number];
type SuperbowlPick =
  RouterOutputs["league"]["superbowlPicks"]["superbowlPicks"][number];

// Contest result for a single pick
export type ContestResult = {
  pick: SuperbowlPick;
  winnerCorrect: boolean;
  loserCorrect: boolean;
  scoreDiff: number;
  rank: number;
  isWinner: boolean;
};

// Bracket state exposed to parent
export type BracketState = {
  remainingTeamIds: Set<number>;
  playoffTeamIds: Set<number>; // All teams that started in playoffs
  superBowlWinner: number | null;
  superBowlLoser: number | null;
  totalScore: number | null;
  contestResults: ContestResult[];
  hasSimulations: boolean;
  isComplete: boolean; // Super Bowl has a winner
};

type PlayoffBracketProps = {
  bracket: RouterOutputs["postseason"]["getBracket"];
  teams: Team[];
  superbowlPicks: SuperbowlPick[];
  leagueName: string;
  onBracketStateChange?: (state: BracketState) => void;
};

type BracketSlotProps = {
  teamId: number | null; // test
  seed: number | null;
  isWinner: boolean;
  isEliminated: boolean;
  onClick?: () => void;
  canClick: boolean;
  teamById: Map<number, Team>;
  score?: number | null;
};

function BracketSlot({
  teamId,
  seed,
  isWinner,
  isEliminated,
  onClick,
  canClick,
  teamById,
  score,
}: BracketSlotProps) {
  const team = teamId ? teamById.get(teamId) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded px-1 py-0.5 transition-colors md:gap-1.5 md:px-2 md:py-1",
        canClick && "cursor-pointer hover:bg-muted",
        isWinner && "bg-muted",
      )}
      onClick={canClick ? onClick : undefined}
    >
      {seed !== null && (
        <span className="w-3 text-[10px] font-bold text-muted-foreground md:w-4 md:text-xs">
          {seed}
        </span>
      )}
      {team ? (
        <>
          <TeamLogo
            abbrev={team.abbrev ?? ""}
            width={16}
            height={16}
            className="md:h-5 md:w-5"
          />
          <span
            className={cn(
              "flex-1 text-xs font-medium md:text-sm",
              isWinner && "text-correct",
              isEliminated && !isWinner && "text-destructive line-through",
              !isWinner && !isEliminated && teamId && "text-foreground",
            )}
          >
            {team.abbrev}
          </span>
        </>
      ) : (
        <>
          <div className="h-4 w-4 rounded bg-muted md:h-5 md:w-5" />
          <span className="flex-1 text-xs font-medium text-muted-foreground md:text-sm">
            TBD
          </span>
        </>
      )}
      {score !== null && score !== undefined && (
        <span className="text-xs tabular-nums md:text-sm">{score}</span>
      )}
    </div>
  );
}

type BracketGameCardProps = {
  gameId: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeSeed: number | null;
  awaySeed: number | null;
  winnerId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  isSimulated: boolean;
  isFinished: boolean;
  canSimulate: boolean;
  onSelectWinner: (gameId: string, teamId: number) => void;
  teamById: Map<number, Team>;
  remainingTeamIds: Set<number>;
  playoffTeamIds: Set<number>;
};

function BracketGameCard({
  gameId,
  homeTeamId,
  awayTeamId,
  homeSeed,
  awaySeed,
  winnerId,
  homeScore,
  awayScore,
  isSimulated,
  isFinished,
  canSimulate,
  onSelectWinner,
  teamById,
  remainingTeamIds,
  playoffTeamIds,
}: BracketGameCardProps) {
  const isTBD = !homeTeamId || !awayTeamId;

  // A team is eliminated if it was in the playoffs but is no longer remaining
  const isEliminated = (teamId: number | null) => {
    if (!teamId) return false;
    return playoffTeamIds.has(teamId) && !remainingTeamIds.has(teamId);
  };

  return (
    <Card
      className={cn(
        "min-w-[120px] border transition-colors md:min-w-[150px]",
        isSimulated && "border-warning",
        !isSimulated && isFinished && "border-muted",
        !isSimulated && !isFinished && "border-border",
      )}
    >
      <div className="flex flex-col gap-0.5 p-1 md:gap-1 md:p-2">
        {/* Away Team (higher seed = visitor) */}
        <BracketSlot
          teamId={awayTeamId}
          seed={awaySeed}
          isWinner={winnerId === awayTeamId && awayTeamId !== null}
          isEliminated={isEliminated(awayTeamId)}
          onClick={() => awayTeamId && onSelectWinner(gameId, awayTeamId)}
          canClick={canSimulate && awayTeamId !== null}
          teamById={teamById}
          score={awayScore}
        />

        {/* Home Team (lower seed = home) */}
        <BracketSlot
          teamId={homeTeamId}
          seed={homeSeed}
          isWinner={winnerId === homeTeamId && homeTeamId !== null}
          isEliminated={isEliminated(homeTeamId)}
          onClick={() => homeTeamId && onSelectWinner(gameId, homeTeamId)}
          canClick={canSimulate && homeTeamId !== null}
          teamById={teamById}
          score={homeScore}
        />

        {/* Status indicator - only show for special states */}
        {(isSimulated || isFinished || isTBD) && (
          <div className="text-center">
            {isSimulated && (
              <Badge
                variant="outline"
                className="border-warning text-xs text-warning"
              >
                Simulated
              </Badge>
            )}
            {!isSimulated && isFinished && (
              <Text.Muted className="text-xs">Final</Text.Muted>
            )}
            {isTBD && !isSimulated && (
              <Text.Muted className="text-xs">TBD</Text.Muted>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Calculate the Super Bowl contest winner(s)
 */
function calculateContestResults(
  picks: SuperbowlPick[],
  actualWinner: number | null,
  actualLoser: number | null,
  actualTotalScore: number | null,
): Array<{
  pick: SuperbowlPick;
  winnerCorrect: boolean;
  loserCorrect: boolean;
  scoreDiff: number;
  rank: number;
  isWinner: boolean;
}> {
  if (!picks.length) return [];

  const results = picks.map((pick) => {
    const winnerCorrect = actualWinner !== null && pick.winner === actualWinner;
    const loserCorrect = actualLoser !== null && pick.loser === actualLoser;
    const pickScore = pick.score ?? 0;
    const scoreDiff =
      actualTotalScore !== null
        ? Math.abs(pickScore - actualTotalScore)
        : Infinity;

    return {
      pick,
      winnerCorrect,
      loserCorrect,
      scoreDiff,
      rank: 0,
      isWinner: false,
    };
  });

  results.sort((a, b) => {
    if (a.winnerCorrect !== b.winnerCorrect) return a.winnerCorrect ? -1 : 1;
    if (a.loserCorrect !== b.loserCorrect) return a.loserCorrect ? -1 : 1;
    return a.scoreDiff - b.scoreDiff;
  });

  for (let i = 0; i < results.length; i++) {
    const curr = results[i]!;
    if (i === 0) {
      curr.rank = 1;
    } else {
      const prev = results[i - 1]!;
      curr.rank =
        prev.winnerCorrect === curr.winnerCorrect &&
        prev.loserCorrect === curr.loserCorrect &&
        prev.scoreDiff === curr.scoreDiff
          ? prev.rank
          : i + 1;
    }
  }

  results.forEach((r) => (r.isWinner = r.rank === 1));
  return results;
}

export function PlayoffBracket({
  bracket,
  teams,
  superbowlPicks,
  onBracketStateChange,
}: PlayoffBracketProps) {
  // Map of gameId -> simulated winner teamId
  // gameId can be actual DB game ID or synthetic like "div-AFC-0"
  const [simulatedWinners, setSimulatedWinners] = useState<Map<string, number>>(
    new Map(),
  );
  const [simulatedTotalScore, setSimulatedTotalScore] = useState<number | null>(
    null,
  );

  const teamById = useMemo(
    () => new Map(teams.map((t) => [t.teamid, t])),
    [teams],
  );
  const seeds = bracket.seeds;

  const getSeed = useCallback(
    (teamId: number | null): number | null => {
      if (!teamId) return null;
      return seeds[teamId] ?? null;
    },
    [seeds],
  );

  // Create stable game IDs for each slot in the bracket
  const getGameId = useCallback(
    (
      round: string,
      conference: string,
      index: number,
      actualGame?: PostseasonGame,
    ) => {
      // Prefer actual game ID if game has teams
      if (actualGame && (actualGame.home_team || actualGame.away_team)) {
        return actualGame.game_id;
      }
      return `${round}-${conference}-${index}`;
    },
    [],
  );

  // Get winner for any game ID (actual or synthetic)
  const getWinnerForGame = useCallback(
    (gameId: string, actualGame?: PostseasonGame): number | null => {
      // Check simulated first
      const simulated = simulatedWinners.get(gameId);
      if (simulated) return simulated;
      // Fall back to actual game result
      if (actualGame?.winner) return actualGame.winner;
      return null;
    },
    [simulatedWinners],
  );

  const isSimulated = useCallback(
    (gameId: string): boolean => {
      return simulatedWinners.has(gameId);
    },
    [simulatedWinners],
  );

  // Determine which round a game belongs to based on its ID
  const getRoundFromGameId = useCallback(
    (gameId: string): "wc" | "div" | "conf" | "sb" | null => {
      // Check synthetic IDs first
      if (gameId.startsWith("wc-")) return "wc";
      if (gameId.startsWith("div-")) return "div";
      if (gameId.startsWith("conf-")) return "conf";
      if (gameId.startsWith("sb-")) return "sb";

      // Check actual games from bracket
      for (const conf of ["AFC", "NFC"] as const) {
        if (bracket.wild_card[conf].some((g) => g.game_id === gameId))
          return "wc";
        if (bracket.divisional[conf].some((g) => g.game_id === gameId))
          return "div";
        if (bracket.conference[conf].some((g) => g.game_id === gameId))
          return "conf";
      }
      if (bracket.super_bowl.some((g) => g.game_id === gameId)) return "sb";

      return null;
    },
    [bracket],
  );

  // Get all game IDs for rounds that come after a given round
  const getLaterRoundGameIds = useCallback(
    (round: "wc" | "div" | "conf" | "sb"): string[] => {
      const ids: string[] = [];
      const roundOrder = ["wc", "div", "conf", "sb"];
      const roundIndex = roundOrder.indexOf(round);

      // Collect all game IDs from rounds after this one
      for (let i = roundIndex + 1; i < roundOrder.length; i++) {
        const laterRound = roundOrder[i];

        if (laterRound === "div") {
          for (const conf of ["AFC", "NFC"] as const) {
            // Add synthetic IDs
            ids.push(`div-${conf}-0`, `div-${conf}-1`);
            // Add actual game IDs
            bracket.divisional[conf].forEach((g) => ids.push(g.game_id));
          }
        } else if (laterRound === "conf") {
          for (const conf of ["AFC", "NFC"] as const) {
            ids.push(`conf-${conf}-0`);
            bracket.conference[conf].forEach((g) => ids.push(g.game_id));
          }
        } else if (laterRound === "sb") {
          ids.push(`sb-SB-0`);
          bracket.super_bowl.forEach((g) => ids.push(g.game_id));
        }
      }

      return ids;
    },
    [bracket],
  );

  const handleSelectWinner = useCallback(
    (gameId: string, teamId: number) => {
      setSimulatedWinners((prev) => {
        const next = new Map(prev);

        // Determine the round of this game
        const round = getRoundFromGameId(gameId);

        if (next.get(gameId) === teamId) {
          // Toggling off - just remove this simulation
          next.delete(gameId);
        } else {
          // Setting a new winner - clear later rounds first
          if (round) {
            const laterGameIds = getLaterRoundGameIds(round);
            for (const id of laterGameIds) {
              next.delete(id);
            }
          }
          next.set(gameId, teamId);
        }

        return next;
      });

      // Also clear total score if we're changing anything before super bowl
      const round = getRoundFromGameId(gameId);
      if (round && round !== "sb") {
        setSimulatedTotalScore(null);
      }
    },
    [getRoundFromGameId, getLaterRoundGameIds],
  );

  /**
   * Calculate the full bracket state based on actual results + simulations
   */
  const bracketState = useMemo(() => {
    const state = {
      wildCard: {
        AFC: [] as Array<{
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        }>,
        NFC: [] as Array<{
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        }>,
      },
      divisional: {
        AFC: [] as Array<{
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        }>,
        NFC: [] as Array<{
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        }>,
      },
      conference: {
        AFC: null as {
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        } | null,
        NFC: null as {
          gameId: string;
          homeTeamId: number | null;
          awayTeamId: number | null;
          winnerId: number | null;
          isSimulated: boolean;
          isFinished: boolean;
          homeScore: number | null;
          awayScore: number | null;
        } | null,
      },
      superBowl: null as {
        gameId: string;
        homeTeamId: number | null;
        awayTeamId: number | null;
        winnerId: number | null;
        isSimulated: boolean;
        isFinished: boolean;
        homeScore: number | null;
        awayScore: number | null;
      } | null,
      byeTeams: {
        AFC: null as number | null,
        NFC: null as number | null,
      },
    };

    // Get bye teams (#1 seeds)
    for (const conf of ["AFC", "NFC"] as const) {
      const byeTeam = bracket.seedsByConference[conf].find((s) => s.seed === 1);
      state.byeTeams[conf] = byeTeam?.teamid ?? null;
    }

    // Process Wild Card games
    for (const conf of ["AFC", "NFC"] as const) {
      const games = bracket.wild_card[conf];
      for (let i = 0; i < games.length; i++) {
        const game = games[i]!;
        const gameId = getGameId("wc", conf, i, game);
        state.wildCard[conf].push({
          gameId,
          homeTeamId: game.home_team,
          awayTeamId: game.away_team,
          winnerId: getWinnerForGame(gameId, game),
          isSimulated: isSimulated(gameId),
          isFinished: game.done,
          homeScore: game.home_score,
          awayScore: game.away_score,
        });
      }
    }

    // Process Divisional games (computed from WC results)
    for (const conf of ["AFC", "NFC"] as const) {
      const actualGames = bracket.divisional[conf];
      const wcGames = state.wildCard[conf];
      const byeTeamId = state.byeTeams[conf];

      // Get WC winners with seeds
      const wcWinners: Array<{ teamId: number; seed: number }> = [];
      for (const wc of wcGames) {
        if (wc.winnerId) {
          const seed = getSeed(wc.winnerId);
          if (seed !== null) {
            wcWinners.push({ teamId: wc.winnerId, seed });
          }
        }
      }

      // If actual divisional games have teams, use those
      const hasActualTeams = actualGames.some(
        (g) => g.home_team && g.away_team,
      );

      if (hasActualTeams) {
        for (let i = 0; i < actualGames.length; i++) {
          const game = actualGames[i]!;
          const gameId = getGameId("div", conf, i, game);
          state.divisional[conf].push({
            gameId,
            homeTeamId: game.home_team,
            awayTeamId: game.away_team,
            winnerId: getWinnerForGame(gameId, game),
            isSimulated: isSimulated(gameId),
            isFinished: game.done,
            homeScore: game.home_score,
            awayScore: game.away_score,
          });
        }
      } else if (wcWinners.length === 3 && byeTeamId) {
        // Calculate matchups from WC results
        wcWinners.sort((a, b) => a.seed - b.seed);
        const lowestSeedTeam = wcWinners[2]!; // Highest seed number (e.g., 7)
        const middleSeeds = wcWinners.slice(0, 2);
        middleSeeds.sort((a, b) => a.seed - b.seed);

        const hasWcSim = wcGames.some((g) => g.isSimulated);

        // Game 0: #1 vs lowest remaining
        const gameId0 = getGameId("div", conf, 0, actualGames[0]);
        state.divisional[conf].push({
          gameId: gameId0,
          homeTeamId: byeTeamId,
          awayTeamId: lowestSeedTeam.teamId,
          winnerId: getWinnerForGame(gameId0, actualGames[0]),
          isSimulated: hasWcSim || isSimulated(gameId0),
          isFinished: actualGames[0]?.done ?? false,
          homeScore: actualGames[0]?.home_score ?? null,
          awayScore: actualGames[0]?.away_score ?? null,
        });

        // Game 1: Middle seeds play each other
        const gameId1 = getGameId("div", conf, 1, actualGames[1]);
        state.divisional[conf].push({
          gameId: gameId1,
          homeTeamId: middleSeeds[0]?.teamId ?? null,
          awayTeamId: middleSeeds[1]?.teamId ?? null,
          winnerId: getWinnerForGame(gameId1, actualGames[1]),
          isSimulated: hasWcSim || isSimulated(gameId1),
          isFinished: actualGames[1]?.done ?? false,
          homeScore: actualGames[1]?.home_score ?? null,
          awayScore: actualGames[1]?.away_score ?? null,
        });
      } else {
        // Not enough WC results - show placeholder
        const hasWcSim = wcGames.some((g) => g.isSimulated);
        for (let i = 0; i < 2; i++) {
          const gameId = getGameId("div", conf, i, actualGames[i]);
          state.divisional[conf].push({
            gameId,
            homeTeamId: i === 0 ? byeTeamId : null,
            awayTeamId: null,
            winnerId: null,
            isSimulated: hasWcSim,
            isFinished: false,
            homeScore: null,
            awayScore: null,
          });
        }
      }
    }

    // Process Conference Championship (computed from Divisional results)
    for (const conf of ["AFC", "NFC"] as const) {
      const actualGame = bracket.conference[conf][0];
      const divGames = state.divisional[conf];

      const hasActualTeams =
        actualGame && actualGame.home_team && actualGame.away_team;

      if (hasActualTeams) {
        const gameId = getGameId("conf", conf, 0, actualGame);
        state.conference[conf] = {
          gameId,
          homeTeamId: actualGame.home_team,
          awayTeamId: actualGame.away_team,
          winnerId: getWinnerForGame(gameId, actualGame),
          isSimulated: isSimulated(gameId),
          isFinished: actualGame.done,
          homeScore: actualGame.home_score,
          awayScore: actualGame.away_score,
        };
      } else {
        // Calculate from divisional results
        const divWinners: Array<{ teamId: number; seed: number }> = [];
        for (const div of divGames) {
          if (div.winnerId) {
            const seed = getSeed(div.winnerId);
            if (seed !== null) {
              divWinners.push({ teamId: div.winnerId, seed });
            }
          }
        }

        const gameId = getGameId("conf", conf, 0, actualGame);
        const hasDivSim = divGames.some((g) => g.isSimulated);

        if (divWinners.length === 2) {
          divWinners.sort((a, b) => a.seed - b.seed);
          state.conference[conf] = {
            gameId,
            homeTeamId: divWinners[0]!.teamId,
            awayTeamId: divWinners[1]!.teamId,
            winnerId: getWinnerForGame(gameId, actualGame),
            isSimulated: hasDivSim || isSimulated(gameId),
            isFinished: actualGame?.done ?? false,
            homeScore: actualGame?.home_score ?? null,
            awayScore: actualGame?.away_score ?? null,
          };
        } else {
          state.conference[conf] = {
            gameId,
            homeTeamId: divWinners[0]?.teamId ?? null,
            awayTeamId: divWinners[1]?.teamId ?? null,
            winnerId: null,
            isSimulated: hasDivSim,
            isFinished: false,
            homeScore: null,
            awayScore: null,
          };
        }
      }
    }

    // Process Super Bowl
    const actualSb = bracket.super_bowl[0];
    const hasActualSbTeams =
      actualSb && actualSb.home_team && actualSb.away_team;

    if (hasActualSbTeams) {
      const gameId = getGameId("sb", "SB", 0, actualSb);
      state.superBowl = {
        gameId,
        homeTeamId: actualSb.home_team,
        awayTeamId: actualSb.away_team,
        winnerId: getWinnerForGame(gameId, actualSb),
        isSimulated: isSimulated(gameId),
        isFinished: actualSb.done,
        homeScore: actualSb.home_score,
        awayScore: actualSb.away_score,
      };
    } else {
      const afcChamp = state.conference.AFC?.winnerId ?? null;
      const nfcChamp = state.conference.NFC?.winnerId ?? null;
      const gameId = getGameId("sb", "SB", 0, actualSb);
      const hasConfSim =
        state.conference.AFC?.isSimulated || state.conference.NFC?.isSimulated;

      state.superBowl = {
        gameId,
        homeTeamId: nfcChamp, // NFC is "home"
        awayTeamId: afcChamp,
        winnerId: getWinnerForGame(gameId, actualSb),
        isSimulated: hasConfSim || isSimulated(gameId),
        isFinished: actualSb?.done ?? false,
        homeScore: actualSb?.home_score ?? null,
        awayScore: actualSb?.away_score ?? null,
      };
    }

    return state;
  }, [
    bracket,
    simulatedWinners,
    getSeed,
    getGameId,
    getWinnerForGame,
    isSimulated,
  ]);

  const clearSimulations = () => {
    setSimulatedWinners(new Map());
    setSimulatedTotalScore(null);
  };

  const hasSimulations =
    simulatedWinners.size > 0 || simulatedTotalScore !== null;

  // Get effective Super Bowl result for contest
  const { effectiveWinner, effectiveLoser, effectiveTotalScore } =
    useMemo(() => {
      const sb = bracketState.superBowl;
      if (!sb?.winnerId) {
        return {
          effectiveWinner: null,
          effectiveLoser: null,
          effectiveTotalScore: null,
        };
      }

      const loserId =
        sb.winnerId === sb.homeTeamId ? sb.awayTeamId : sb.homeTeamId;
      const totalScore =
        simulatedTotalScore ??
        (sb.homeScore !== null && sb.awayScore !== null
          ? sb.homeScore + sb.awayScore
          : null);

      return {
        effectiveWinner: sb.winnerId,
        effectiveLoser: loserId,
        effectiveTotalScore: totalScore,
      };
    }, [bracketState.superBowl, simulatedTotalScore]);

  const contestResults = useMemo(() => {
    return calculateContestResults(
      superbowlPicks,
      effectiveWinner,
      effectiveLoser,
      effectiveTotalScore,
    );
  }, [superbowlPicks, effectiveWinner, effectiveLoser, effectiveTotalScore]);

  // Calculate remaining teams (teams still alive in the bracket)
  const { remainingTeamIds, playoffTeamIds } = useMemo(() => {
    const eliminated = new Set<number>();

    // Get all teams that started in the playoffs (from seeds)
    const allPlayoffTeamIds = new Set(Object.keys(bracket.seeds).map(Number));

    // Helper: if a game has a winner, the loser is eliminated
    const processGame = (game: {
      winnerId: number | null;
      homeTeamId: number | null;
      awayTeamId: number | null;
    }) => {
      if (game.winnerId) {
        const loserId =
          game.winnerId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
        if (loserId) eliminated.add(loserId);
      }
    };

    // Process each round
    for (const conf of ["AFC", "NFC"] as const) {
      bracketState.wildCard[conf].forEach(processGame);
      bracketState.divisional[conf].forEach(processGame);
      if (bracketState.conference[conf]) {
        processGame(bracketState.conference[conf]!);
      }
    }
    if (bracketState.superBowl) {
      processGame(bracketState.superBowl);
    }

    // Remaining = all playoff teams minus eliminated ones
    const remaining = new Set<number>();
    for (const teamId of allPlayoffTeamIds) {
      if (!eliminated.has(teamId)) {
        remaining.add(teamId);
      }
    }

    return { remainingTeamIds: remaining, playoffTeamIds: allPlayoffTeamIds };
  }, [bracket.seeds, bracketState]);

  // Notify parent of bracket state changes
  useEffect(() => {
    if (!onBracketStateChange) return;

    const state: BracketState = {
      remainingTeamIds,
      playoffTeamIds,
      superBowlWinner: effectiveWinner,
      superBowlLoser: effectiveLoser,
      totalScore: effectiveTotalScore,
      contestResults,
      hasSimulations,
      isComplete: !!effectiveWinner,
    };

    onBracketStateChange(state);
  }, [
    onBracketStateChange,
    remainingTeamIds,
    playoffTeamIds,
    effectiveWinner,
    effectiveLoser,
    effectiveTotalScore,
    contestResults,
    hasSimulations,
  ]);

  // Render wild card round
  const renderWildCard = (conference: "AFC" | "NFC") => {
    const games = bracketState.wildCard[conference];
    const byeTeamId = bracketState.byeTeams[conference];

    return (
      <div className="flex flex-col gap-1 md:gap-2">
        {/* Bye Team */}
        {byeTeamId && (
          <Card className="min-w-[120px] border border-primary/30 bg-primary/5 md:min-w-[150px]">
            <div className="p-1 md:p-2">
              <BracketSlot
                teamId={byeTeamId}
                seed={1}
                isWinner={true}
                isEliminated={false}
                canClick={false}
                teamById={teamById}
              />
              <div className="text-center">
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[10px] md:h-5 md:text-xs"
                >
                  BYE
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Wild Card Games */}
        {games.map((game) => (
          <BracketGameCard
            key={game.gameId}
            gameId={game.gameId}
            homeTeamId={game.homeTeamId}
            awayTeamId={game.awayTeamId}
            homeSeed={getSeed(game.homeTeamId)}
            awaySeed={getSeed(game.awayTeamId)}
            winnerId={game.winnerId}
            homeScore={game.homeScore}
            awayScore={game.awayScore}
            isSimulated={game.isSimulated}
            isFinished={game.isFinished}
            canSimulate={
              !game.isFinished &&
              game.homeTeamId !== null &&
              game.awayTeamId !== null
            }
            onSelectWinner={handleSelectWinner}
            teamById={teamById}
            remainingTeamIds={remainingTeamIds}
            playoffTeamIds={playoffTeamIds}
          />
        ))}
      </div>
    );
  };

  // Render divisional round
  const renderDivisional = (conference: "AFC" | "NFC") => {
    const games = bracketState.divisional[conference];

    return (
      <div className="flex flex-col gap-1 md:gap-2">
        {games.map((game) => (
          <BracketGameCard
            key={game.gameId}
            gameId={game.gameId}
            homeTeamId={game.homeTeamId}
            awayTeamId={game.awayTeamId}
            homeSeed={getSeed(game.homeTeamId)}
            awaySeed={getSeed(game.awayTeamId)}
            winnerId={game.winnerId}
            homeScore={game.homeScore}
            awayScore={game.awayScore}
            isSimulated={game.isSimulated}
            isFinished={game.isFinished}
            canSimulate={
              !game.isFinished &&
              game.homeTeamId !== null &&
              game.awayTeamId !== null
            }
            onSelectWinner={handleSelectWinner}
            teamById={teamById}
            remainingTeamIds={remainingTeamIds}
            playoffTeamIds={playoffTeamIds}
          />
        ))}
      </div>
    );
  };

  // Render conference championship
  const renderConference = (conference: "AFC" | "NFC") => {
    const game = bracketState.conference[conference];
    if (!game) return null;

    return (
      <div className="flex flex-col gap-1 md:gap-2">
        <BracketGameCard
          gameId={game.gameId}
          homeTeamId={game.homeTeamId}
          awayTeamId={game.awayTeamId}
          homeSeed={getSeed(game.homeTeamId)}
          awaySeed={getSeed(game.awayTeamId)}
          winnerId={game.winnerId}
          homeScore={game.homeScore}
          awayScore={game.awayScore}
          isSimulated={game.isSimulated}
          isFinished={game.isFinished}
          canSimulate={
            !game.isFinished &&
            game.homeTeamId !== null &&
            game.awayTeamId !== null
          }
          onSelectWinner={handleSelectWinner}
          teamById={teamById}
          remainingTeamIds={remainingTeamIds}
          playoffTeamIds={playoffTeamIds}
        />
      </div>
    );
  };

  // Render Super Bowl
  const renderSuperBowl = () => {
    const game = bracketState.superBowl;
    if (!game) return null;

    return (
      <div className="flex flex-col gap-1 md:gap-2">
        <BracketGameCard
          gameId={game.gameId}
          homeTeamId={game.homeTeamId}
          awayTeamId={game.awayTeamId}
          homeSeed={null}
          awaySeed={null}
          winnerId={game.winnerId}
          homeScore={game.homeScore}
          awayScore={game.awayScore}
          isSimulated={game.isSimulated}
          isFinished={game.isFinished}
          canSimulate={
            !game.isFinished &&
            game.homeTeamId !== null &&
            game.awayTeamId !== null
          }
          onSelectWinner={handleSelectWinner}
          teamById={teamById}
          remainingTeamIds={remainingTeamIds}
          playoffTeamIds={playoffTeamIds}
        />

        {/* Score input */}
        {game.homeTeamId &&
          game.awayTeamId &&
          (!game.isFinished || game.isSimulated) && (
            <div className="mt-1 flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground">
                Total Score
              </span>
              <Input
                type="number"
                min={0}
                max={200}
                placeholder="Score"
                value={simulatedTotalScore ?? ""}
                onChange={(e) => {
                  const val = e.target.value
                    ? parseInt(e.target.value, 10)
                    : null;
                  setSimulatedTotalScore(val);
                }}
                className={cn(
                  "h-7 text-xs",
                  simulatedTotalScore !== null && "border-warning",
                )}
              />
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-base">Playoff Bracket</CardTitle>
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-normal"
          >
            Beta
          </Badge>
          {!hasSimulations && (
            <span className="text-[10px] text-muted-foreground">
              Click teams to simulate
            </span>
          )}
        </div>
        {hasSimulations && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={clearSimulations}
          >
            Clear Simulations
          </Button>
        )}
      </div>

      {/* Bracket Grid - NFL style layout */}
      <div className="overflow-x-scroll">
        <div className="flex items-start gap-2 pb-2 md:gap-4 md:pb-4">
          {/* AFC Side */}
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className="h-5 bg-red-100 px-1.5 text-[10px] text-red-700 dark:bg-red-900 dark:text-red-300 md:h-6 md:text-xs"
              >
                AFC
              </Badge>
              <span className="text-[10px] font-semibold text-muted-foreground md:text-xs">
                Wild Card
              </span>
            </div>
            {renderWildCard("AFC")}
          </div>

          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-center text-[10px] font-semibold text-muted-foreground md:text-xs">
              Divisional
            </span>
            {renderDivisional("AFC")}
          </div>

          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-center text-[10px] font-semibold text-muted-foreground md:text-xs">
              Conference
            </span>
            {renderConference("AFC")}
          </div>

          {/* Super Bowl */}
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-center text-[10px] font-semibold text-muted-foreground md:text-xs">
              Super Bowl
            </span>
            {renderSuperBowl()}
          </div>

          {/* NFC Side */}
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-center text-[10px] font-semibold text-muted-foreground md:text-xs">
              Conference
            </span>
            {renderConference("NFC")}
          </div>

          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-center text-[10px] font-semibold text-muted-foreground md:text-xs">
              Divisional
            </span>
            {renderDivisional("NFC")}
          </div>

          <div className="flex flex-col gap-1 md:gap-2">
            <div className="flex items-center justify-end gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground md:text-xs">
                Wild Card
              </span>
              <Badge
                variant="secondary"
                className="h-5 bg-blue-100 px-1.5 text-[10px] text-blue-700 dark:bg-blue-900 dark:text-blue-300 md:h-6 md:text-xs"
              >
                NFC
              </Badge>
            </div>
            {renderWildCard("NFC")}
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma as db, espn, resendApi } from "@funtime/api";
import { addHours } from "date-fns";
import { chunk, groupBy, orderBy } from "lodash";

import { DEFAULT_SEASON } from "../utils/const";
import { Defined } from "../utils/defined";

const LOG_PREFIX = "[cron]";

export async function run() {
  const _startTime = Date.now();

  console.log(`${LOG_PREFIX} starting cron...`);

  const season = DEFAULT_SEASON;

  // const msfGames = await msf.getGamesBySeason({ season });
  const espnGames = await espn.getGamesBySeason({ season });
  console.log(
    `${LOG_PREFIX} Full espnGames response as second parameter`,
    espnGames,
  );
  console.log(
    `${LOG_PREFIX} Full espnGames response as stringified: ${JSON.stringify(espnGames)}`,
  );

  console.log(`${LOG_PREFIX} espn games ${JSON.stringify(espnGames)}`);
  let games = await db.games.findMany({
    where: {
      season,
    },
  });
  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

  const gamesByEspnId = groupBy(games, (g) => g.espn_id);
  const espnGamesById = groupBy(espnGames, (g) => Number(g.id));

  await db.$transaction(
    espnGames
      .map((espnGame) => {
        const espnGameId = Number(espnGame.id);
        const game = gamesByEspnId[espnGameId]?.at(0);
        const espnCompetition = espnGame.competitions.at(0);
        const homeCompetitor = espnCompetition?.competitors.find(
          (t) => t.homeAway === "home",
        );
        const awayCompetitor = espnCompetition?.competitors.find(
          (t) => t.homeAway === "away",
        );

        const homeTeam =
          teamByAbbrev[
            espn.translateAbbreviation(homeCompetitor?.team?.abbreviation ?? "")
          ]?.at(0);
        const awayTeam =
          teamByAbbrev[
            espn.translateAbbreviation(awayCompetitor?.team?.abbreviation ?? "")
          ]?.at(0);

        if (!awayTeam || !homeTeam || !game || !espnCompetition || game.done) {
          if (espnGame.week.number === 2) {
            console.log(
              `${LOG_PREFIX} Could not find game or teams for ESPN game ${JSON.stringify(espnGame)}`,
            );
          }
          return null;
        }
        const done = espnCompetition?.status.type.name === "STATUS_FINAL";
        const homeScore = homeCompetitor?.score
          ? Number(homeCompetitor.score)
          : null;
        const awayScore = awayCompetitor?.score
          ? Number(awayCompetitor.score)
          : null;

        let winner: number | null = null;
        if (done && homeScore !== null && awayScore !== null) {
          if (homeScore > awayScore) {
            winner = game.home;
          } else if (awayScore > homeScore) {
            winner = game.away;
          }
        }
        const data = {
          awayscore: awayScore ?? 0,
          homescore: homeScore ?? 0,
          done,
          winner,
          current_quarter: espnCompetition.status.period ?? 0,
          current_quarter_seconds_remaining: espnCompetition.status.clock,
        } satisfies Parameters<typeof db.games.update>[0]["data"];

        console.log(
          `${LOG_PREFIX} going to update game ${game.gid} with data ${JSON.stringify(data)}, got msf data ${JSON.stringify(espnGame)}`,
        );

        return db.games.update({
          where: {
            gid: game.gid,
          },
          data,
        });
      })
      .filter(Defined),
  );

  games = await db.games.findMany({
    where: {
      season,
    },
  });
  const gamesById = groupBy(games, (g) => g.gid);

  // update picks
  const picks = await db.picks.findMany({
    where: {
      gid: {
        in: games.map((g) => g.gid),
      },
    },
  });
  const picksByGid = groupBy(picks, (p) => p.gid);
  for (const gid of Object.keys(picksByGid)) {
    const game = gamesById[gid]?.at(0);
    if (!game?.done) {
      continue;
    }
    const picks = picksByGid[gid] ?? [];
    const toMakeCorrect = picks.filter((p) => p.winner === game.winner);
    const toMakeWrong = picks.filter((p) => p.winner !== game.winner);
    console.log(
      `${LOG_PREFIX} going to update ${toMakeCorrect.length} correct (${toMakeWrong.length} wrong) picks for gid ${gid}`,
    );
    await db.picks.updateMany({
      where: {
        pickid: {
          in: toMakeCorrect.map((p) => p.pickid),
        },
      },
      data: {
        correct: 1,
      },
    });
    await db.picks.updateMany({
      where: {
        pickid: {
          in: toMakeWrong.map((p) => p.pickid),
        },
      },
      data: {
        correct: 0,
      },
    });
  }

  games = orderBy(games, ["week", "ts"], ["asc", "asc"]);

  // update WeekWinners
  // Get all leagues
  const [leagues, existingWinners] = await Promise.all([
    db.leagues.findMany({
      where: { season },
    }),
    db.weekWinners.findMany({
      where: {
        leagues: {
          season,
        },
      },
    }),
  ]);

  // Process each league
  for (const league of leagues) {
    // Get all done weeks
    const doneWeeks = games
      .filter((game) => game.done)
      .map((game) => game.week);
    const uniqueDoneWeeks = [...new Set(doneWeeks)];

    // Process each done week
    for (const week of uniqueDoneWeeks) {
      // Check if all games for this week are done
      const allGamesDone = games
        .filter((game) => game.week === week)
        .every((game) => game.done);

      if (!allGamesDone) continue;

      const hasExistingWinner = existingWinners.some(
        (w) => w.league_id === league.league_id && w.week === week,
      );

      if (hasExistingWinner) {
        continue;
      }

      // Get all picks for this league and week
      const picks = await db.picks.findMany({
        where: {
          leaguemembers: {
            league_id: league.league_id,
          },
          week,
        },
        include: {
          people: true,
        },
      });

      // Group picks by person
      const picksByMember = groupBy(picks, (pick) => pick.member_id);

      // Calculate scores for each person
      const scores = Object.entries(picksByMember).map(
        ([memberId, personPicks]) => {
          const correctPicks = personPicks.filter(
            (pick) => pick.correct === 1,
          ).length;
          const tiebreakerGame = games.find(
            (game) => game.week === week && game.is_tiebreaker,
          );
          const tiebreakerPick = personPicks.find(
            (pick) => pick.gid === tiebreakerGame?.gid,
          );
          const tiebreakerDiff =
            tiebreakerPick && tiebreakerPick.score !== null && tiebreakerGame
              ? Math.abs(
                  tiebreakerPick.score -
                    ((tiebreakerGame.homescore ?? 0) +
                      (tiebreakerGame.awayscore ?? 0)),
                )
              : Infinity;

          return {
            memberId: parseInt(memberId),
            correctPicks,
            tiebreakerDiff,
          };
        },
      );

      // Sort scores
      const sortedScores = orderBy(
        scores,
        ["correctPicks", "tiebreakerDiff"],
        ["desc", "asc"],
      );

      if (!sortedScores.length) continue;

      // Determine winner(s)
      const winners = sortedScores.filter(
        (score) =>
          score.correctPicks === sortedScores[0]?.correctPicks &&
          score.tiebreakerDiff === sortedScores[0]?.tiebreakerDiff,
      );

      // Update or create WeekWinners
      for (const winner of winners) {
        await db.weekWinners.create({
          data: {
            league_id: league.league_id,
            week,
            membership_id: winner.memberId,
            correct_count: winner.correctPicks,
            score_diff: winner.tiebreakerDiff,
          },
        });
      }

      console.log(
        `${LOG_PREFIX} Updated WeekWinners for league ${league.league_id}, week ${week} to be ${JSON.stringify(winners)}`,
      );
    }
  }

  // update game records
  const gamesByTeamId = games.reduce((acc, curr) => {
    if (!acc.has(curr.away)) {
      acc.set(curr.away, []);
    }
    acc.get(curr.away)?.push(curr);
    if (!acc.has(curr.home)) {
      acc.set(curr.home, []);
    }
    acc.get(curr.home)?.push(curr);
    return acc;
  }, new Map<number, typeof games>());

  await db.$transaction(
    games.map((game) => {
      const homePriorGames =
        gamesByTeamId.get(game.home)?.filter((g) => g.week < game.week) ?? [];
      const awayPriorGames =
        gamesByTeamId.get(game.away)?.filter((g) => g.week < game.week) ?? [];

      const homeDonePriorGames = homePriorGames.filter((g) => g.done);
      const awayDonePriorGames = awayPriorGames.filter((g) => g.done);

      const homeWins = homeDonePriorGames.reduce(
        (prev, curr) => prev + (curr.winner === game.home ? 1 : 0),
        0,
      );
      const awayWins = awayDonePriorGames.reduce(
        (prev, curr) => prev + (curr.winner === game.away ? 1 : 0),
        0,
      );

      const homeLosses = homeDonePriorGames.reduce(
        (prev, curr) =>
          prev + (curr.winner && curr.winner !== game.home ? 1 : 0),
        0,
      );
      const awayLosses = awayDonePriorGames.reduce(
        (prev, curr) =>
          prev + (curr.winner && curr.winner !== game.away ? 1 : 0),
        0,
      );

      const homeTies = homeDonePriorGames.reduce((prev, curr) => {
        return prev + (curr.done && !curr.winner ? 1 : 0);
      }, 0);

      const awayTies = awayDonePriorGames.reduce((prev, curr) => {
        return prev + (curr.done && !curr.winner ? 1 : 0);
      }, 0);

      const awayrecord =
        awayTies > 0
          ? `${awayWins}-${awayLosses}-${awayTies}`
          : `${awayWins}-${awayLosses}`;
      const homerecord =
        homeTies > 0
          ? `${homeWins}-${homeLosses}-${homeTies}`
          : `${homeWins}-${homeLosses}`;

      console.log(
        `${LOG_PREFIX} going to update game ${game.gid} with awayrecord ${awayrecord} homerecord ${homerecord}`,
      );
      return db.games.update({
        where: {
          gid: game.gid,
        },
        data: {
          awayrecord,
          homerecord,
        },
      });
    }),
  );

  console.log(
    `${LOG_PREFIX} updated all games schedules and records (total time ${Math.round((Date.now() - _startTime) / 1000)}s)`,
  );

  // update startTimes (should do it for weeks even that have picks?)
  games = await db.games.findMany({
    where: {
      season,
    },
    orderBy: {
      ts: "asc",
    },
  });

  const now = new Date();
  const firstUnstartedGame = games.find((g) => g.ts > now);
  const firstUnstartedGameWeek = firstUnstartedGame?.week;

  for (const game of games) {
    const espnGame = game.espn_id
      ? espnGamesById[game.espn_id]?.at(0)
      : undefined;
    const espnGameDateSeconds = espnGame
      ? new Date(espnGame.date).getTime()
      : undefined;
    if (
      firstUnstartedGameWeek &&
      espnGame &&
      espnGameDateSeconds &&
      espnGame.week.number > firstUnstartedGameWeek
    ) {
      console.log(
        `${LOG_PREFIX} going to update time for game ${game.gid} to ${espnGameDateSeconds}`,
      );
      await db.games.update({
        where: {
          gid: game.gid,
        },
        data: {
          ts: new Date(espnGame.date),
        },
      });
    }
  }

  // for weeks that don't have picks yet, update is_tiebreaker if needed
  games = await db.games.findMany({
    where: {
      season,
    },
    orderBy: {
      ts: "asc",
    },
  });
  const gamesByWeek = groupBy(games, (g) => g.week);
  const weeksWorthCheckingTiebreakersFor = new Set(
    games
      .map((g) => g.week)
      .filter(
        (week) => firstUnstartedGameWeek && week > firstUnstartedGameWeek,
      ),
  );

  for (const week of Array.from(weeksWorthCheckingTiebreakersFor)) {
    const weekGames = gamesByWeek[week];
    if (!weekGames?.length) {
      continue;
    }
    const calculatedTiebreakerGame = orderBy(
      weekGames,
      ["ts", "msf_id"],
      ["asc", "asc"],
    )?.at(-1);
    const nonTiebreakerGids = weekGames
      .filter((g) => g.gid !== (calculatedTiebreakerGame ?? 0))
      .map((g) => g.gid);
    await db.games.updateMany({
      where: {
        gid: {
          in: nonTiebreakerGids,
        },
      },
      data: {
        is_tiebreaker: false,
      },
    });
    if (calculatedTiebreakerGame) {
      console.log(
        `${LOG_PREFIX} going to set game ${calculatedTiebreakerGame.gid} as tiebreaker (for week ${calculatedTiebreakerGame.week}, ${calculatedTiebreakerGame.season})`,
      );
      await db.games.update({
        where: {
          gid: calculatedTiebreakerGame.gid,
        },
        data: {
          is_tiebreaker: true,
        },
      });
    }
  }

  // Remind members to make picks for the upcoming week
  const upcomingWeek = firstUnstartedGameWeek;

  if (
    upcomingWeek &&
    firstUnstartedGame &&
    addHours(now, 3) >= firstUnstartedGame.ts
  ) {
    const threeHoursBeforePeople = await db.leaguemembers.findMany({
      where: {
        leagues: {
          reminder_policy: "three_hours_before",
          season: DEFAULT_SEASON,
        },
        picks: {
          none: {
            week: upcomingWeek,
          },
        },
        EmailLogs: {
          none: {
            email_type: "week_reminder",
            week: upcomingWeek,
          },
        },
      },
      include: {
        people: true,
      },
    });

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: Array.from(
            new Set(threeHoursBeforePeople.map((p) => p.league_id)),
          ),
        },
      },
    });
    const peopleToSendToChunks = chunk(threeHoursBeforePeople, 100);
    for (const peopleToSendToChunk of peopleToSendToChunks) {
      await Promise.all(
        peopleToSendToChunk.map(async (member) => {
          await resendApi.sendPickReminderEmail({
            member,
            user: member.people,
            league: leagues.find((l) => l.league_id === member.league_id)!,
            week: upcomingWeek,
          });
        }),
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(
    `${LOG_PREFIX} Cron finished successfully in ${Math.round((Date.now() - _startTime) / 1000)}s`,
  );
}

await run().catch((e) => {
  console.error("error running cron", e);
  process.exit(1);
});

process.exit(0);

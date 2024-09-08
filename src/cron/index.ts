import { chunk, groupBy, orderBy } from "lodash";
import { db } from "~/server/db";
import { msf } from "~/server/services/mysportsfeeds";
import { DEFAULT_SEASON } from "~/utils/const";
import { Defined } from "~/utils/defined";
import { addHours } from 'date-fns';
import { resendApi } from "~/server/services/resend";

const LOG_PREFIX = "[cron]";

export async function run() {
  const _startTime = Date.now();

  console.log(`${LOG_PREFIX} starting cron...`);

  const season = DEFAULT_SEASON;

  const msfGames = await msf.getGamesBySeason({ season });

  console.log(`${LOG_PREFIX} msf games ${JSON.stringify(msfGames)}`)
  let games = await db.games.findMany({
    where: {
      season,
    },
  });
  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

  const gamesByMsfId = groupBy(games, (g) => g.msf_id);
  const msfGamesById = groupBy(msfGames, (g) => g.schedule.id);

  await db.$transaction(
    msfGames
      .map((msfGame) => {
        const game = gamesByMsfId[msfGame.schedule.id]?.at(0);
        const awayTeam =
          teamByAbbrev[msfGame.schedule.awayTeam.abbreviation]?.at(0);
        const homeTeam =
          teamByAbbrev[msfGame.schedule.homeTeam.abbreviation]?.at(0);
        if (!awayTeam || !homeTeam || !game || game.done) {
          return null;
        }
        const done = msfGame.schedule.playedStatus === "COMPLETED";

        let winner: number | null = null;
        if (
          done &&
          msfGame.score.homeScoreTotal !== null &&
          msfGame.score.awayScoreTotal !== null
        ) {
          if (msfGame.score.homeScoreTotal > msfGame.score.awayScoreTotal) {
            winner = game.home;
          } else if (
            msfGame.score.awayScoreTotal > msfGame.score.homeScoreTotal
          ) {
            winner = game.away;
          }
        }
        const data = {
          awayscore: msfGame.score.awayScoreTotal ?? 0,
          homescore: msfGame.score.homeScoreTotal ?? 0,
          done,
          winner,
          current_quarter: msfGame.score.currentQuarter,
          current_quarter_seconds_remaining: msfGame.score.currentQuarterSecondsRemaining,
        } satisfies Parameters<typeof db.games.update>[0]["data"];

        console.log(
          `${LOG_PREFIX} going to update game ${game.gid} with data ${JSON.stringify(data)}, got msf data ${JSON.stringify(msfGame)}`,
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

  // update game records
  games = orderBy(games, ["week", "ts"], ["asc", "asc"]);

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
        gamesByTeamId
          .get(game.home)
          ?.filter(
            (g) =>
              (g.home === game.home || g.away === game.home) &&
              g.week < game.week,
          ) ?? [];
      const awayPriorGames =
        gamesByTeamId
          .get(game.away)
          ?.filter(
            (g) =>
              (g.home === game.away || g.away === game.away) &&
              g.week < game.week,
          ) ?? [];

      const homeDonePriorGames = homePriorGames.filter((g) => g.done);
      const awayDonePriorGames = awayPriorGames.filter((g) => g.done);

      const homeWins = homeDonePriorGames.reduce(
        (prev, curr) => prev + (curr.winner === curr.home ? 1 : 0),
        0,
      );
      const awayWins = awayDonePriorGames.reduce(
        (prev, curr) => prev + (curr.winner === curr.away ? 1 : 0),
        0,
      );

      const awayLosses = awayDonePriorGames.length - awayWins;
      const homeLosses = homeDonePriorGames.length - homeWins;
      const awayrecord = `${awayWins}-${awayLosses}`;
      const homerecord = `${homeWins}-${homeLosses}`;

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
    const msfGame = game.msf_id ? msfGamesById[game.msf_id]?.at(0) : undefined;
    if (
      firstUnstartedGameWeek &&
      msfGame &&
      msfGame.schedule.week > firstUnstartedGameWeek
    ) {
      console.log(
        `${LOG_PREFIX} going to update time for game ${game.gid} to ${msfGame.schedule.startTime}`,
      );
      await db.games.update({
        where: {
          gid: game.gid,
        },
        data: {
          ts: new Date(msfGame.schedule.startTime),
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

  if (upcomingWeek && firstUnstartedGame && addHours(now, 3) >= firstUnstartedGame.ts) {
    const threeHoursBeforePeople = await db.leaguemembers.findMany({
      where: {
        leagues: {
          reminder_policy: 'three_hours_before',
          season: DEFAULT_SEASON,
        },
        picks: {
          none: {
            week: upcomingWeek,
          }
        },
        EmailLogs: {
          none: {
            email_type: 'week_reminder',
            week: upcomingWeek,
          }
        }
      },
      include: {
        people: true,
      }
    });

    const leagues = await db.leagues.findMany({
      where: {
        league_id: {
          in: Array.from(new Set(threeHoursBeforePeople.map((p) => p.league_id))),
        },
      }
    })
    const peopleToSendToChunks = chunk(threeHoursBeforePeople, 100);
    for (const peopleToSendToChunk of peopleToSendToChunks) {
      await Promise.all(peopleToSendToChunk.map(async (member) => {
        await resendApi.sendPickReminderEmail({
          member,
          user: member.people,
          league: leagues.find((l) => l.league_id === member.league_id)!,
          week: upcomingWeek,
        })
      }))
      await new Promise(resolve => setTimeout(resolve, 500));
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

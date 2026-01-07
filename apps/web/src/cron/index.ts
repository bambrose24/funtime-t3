import { prisma as db, espn, resendApi } from "@funtime/api";
import { addHours } from "date-fns";
import { chunk, groupBy, orderBy } from "lodash";

import { DEFAULT_SEASON } from "../utils/const";
import { Defined } from "../utils/defined";
import { syncPostseason } from "./postseason";

const LOG_PREFIX = "[cron]";

export async function run() {
  const _startTime = Date.now();

  const season = DEFAULT_SEASON;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`${LOG_PREFIX} Starting cron for season ${season}`);
  console.log(`${"=".repeat(50)}\n`);

  // ========================================
  // Fetch ESPN games
  // ========================================
  console.log(`${LOG_PREFIX} Fetching ESPN games...`);
  const allEspnGames = await espn.getGamesBySeason({ season });
  const espnGames = allEspnGames.filter((g) => g.season.type === 2);
  console.log(
    `${LOG_PREFIX} ✓ Found ${espnGames.length} regular season games (${allEspnGames.length - espnGames.length} postseason filtered out)`,
  );
  // ========================================
  // Update game scores from ESPN
  // ========================================
  console.log(`${LOG_PREFIX} Syncing game scores...`);

  let games = await db.games.findMany({ where: { season } });
  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);
  const gamesByEspnId = groupBy(games, (g) => g.espn_id);
  const espnGamesById = groupBy(espnGames, (g) => Number(g.id));

  const gameUpdates = espnGames
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

      return db.games.update({
        where: { gid: game.gid },
        data: {
          awayscore: awayScore ?? 0,
          homescore: homeScore ?? 0,
          done,
          winner,
          current_quarter: espnCompetition.status.period ?? 0,
          current_quarter_seconds_remaining: espnCompetition.status.clock,
        },
      });
    })
    .filter(Defined);

  await db.$transaction(gameUpdates);
  console.log(`${LOG_PREFIX} ✓ Updated ${gameUpdates.length} game scores`);

  // ========================================
  // Update pick results
  // ========================================
  console.log(`${LOG_PREFIX} Updating pick results...`);

  games = await db.games.findMany({ where: { season } });
  const gamesById = groupBy(games, (g) => g.gid);

  const picks = await db.picks.findMany({
    where: { gid: { in: games.map((g) => g.gid) } },
  });
  const picksByGid = groupBy(picks, (p) => p.gid);

  let picksUpdated = 0;
  for (const gid of Object.keys(picksByGid)) {
    const game = gamesById[gid]?.at(0);
    if (!game?.done) continue;

    const gamePicks = picksByGid[gid] ?? [];
    const toMakeCorrect = gamePicks.filter((p) => p.winner === game.winner);
    const toMakeWrong = gamePicks.filter((p) => p.winner !== game.winner);

    if (toMakeCorrect.length > 0) {
      await db.picks.updateMany({
        where: { pickid: { in: toMakeCorrect.map((p) => p.pickid) } },
        data: { correct: 1 },
      });
    }
    if (toMakeWrong.length > 0) {
      await db.picks.updateMany({
        where: { pickid: { in: toMakeWrong.map((p) => p.pickid) } },
        data: { correct: 0 },
      });
    }
    picksUpdated += toMakeCorrect.length + toMakeWrong.length;
  }
  console.log(`${LOG_PREFIX} ✓ Updated ${picksUpdated} picks`);

  // ========================================
  // Update week winners
  // ========================================
  console.log(`${LOG_PREFIX} Checking week winners...`);

  games = orderBy(games, ["week", "ts"], ["asc", "asc"]);

  const [leagues, existingWinners] = await Promise.all([
    db.leagues.findMany({ where: { season } }),
    db.weekWinners.findMany({ where: { leagues: { season } } }),
  ]);

  let winnersCreated = 0;
  for (const league of leagues) {
    const doneWeeks = [...new Set(games.filter((g) => g.done).map((g) => g.week))];

    for (const week of doneWeeks) {
      const allGamesDone = games
        .filter((g) => g.week === week)
        .every((g) => g.done);

      if (!allGamesDone) continue;
      if (existingWinners.some((w) => w.league_id === league.league_id && w.week === week)) {
        continue;
      }

      const weekPicks = await db.picks.findMany({
        where: { leaguemembers: { league_id: league.league_id }, week },
        include: { people: true },
      });

      const picksByMember = groupBy(weekPicks, (p) => p.member_id);
      const scores = Object.entries(picksByMember).map(([memberId, memberPicks]) => {
        const correctPicks = memberPicks.filter((p) => p.correct === 1).length;
        const tiebreakerGame = games.find((g) => g.week === week && g.is_tiebreaker);
        const tiebreakerPick = memberPicks.find((p) => p.gid === tiebreakerGame?.gid);
        const tiebreakerDiff =
          tiebreakerPick && tiebreakerPick.score !== null && tiebreakerGame
            ? Math.abs(
                tiebreakerPick.score -
                  ((tiebreakerGame.homescore ?? 0) + (tiebreakerGame.awayscore ?? 0)),
              )
            : Infinity;

        return { memberId: parseInt(memberId), correctPicks, tiebreakerDiff };
      });

      const sortedScores = orderBy(scores, ["correctPicks", "tiebreakerDiff"], ["desc", "asc"]);
      if (!sortedScores.length) continue;

      const winners = sortedScores.filter(
        (s) =>
          s.correctPicks === sortedScores[0]?.correctPicks &&
          s.tiebreakerDiff === sortedScores[0]?.tiebreakerDiff,
      );

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
        winnersCreated++;
      }

      if (winners.length > 0) {
        console.log(
          `${LOG_PREFIX} ✓ Week ${week} winner(s) for league ${league.league_id}: ${winners.length} winner(s)`,
        );
      }
    }
  }
  console.log(`${LOG_PREFIX} ✓ Created ${winnersCreated} week winner records`);

  // ========================================
  // Update team records on games
  // ========================================
  console.log(`${LOG_PREFIX} Updating team records...`);

  const gamesByTeamId = games.reduce((acc, curr) => {
    if (!acc.has(curr.away)) acc.set(curr.away, []);
    acc.get(curr.away)?.push(curr);
    if (!acc.has(curr.home)) acc.set(curr.home, []);
    acc.get(curr.home)?.push(curr);
    return acc;
  }, new Map<number, typeof games>());

  const recordUpdates = games.map((game) => {
    const homePriorGames = gamesByTeamId.get(game.home)?.filter((g) => g.week < game.week) ?? [];
    const awayPriorGames = gamesByTeamId.get(game.away)?.filter((g) => g.week < game.week) ?? [];
    const homeDonePriorGames = homePriorGames.filter((g) => g.done);
    const awayDonePriorGames = awayPriorGames.filter((g) => g.done);

    const homeWins = homeDonePriorGames.reduce((p, c) => p + (c.winner === game.home ? 1 : 0), 0);
    const awayWins = awayDonePriorGames.reduce((p, c) => p + (c.winner === game.away ? 1 : 0), 0);
    const homeLosses = homeDonePriorGames.reduce((p, c) => p + (c.winner && c.winner !== game.home ? 1 : 0), 0);
    const awayLosses = awayDonePriorGames.reduce((p, c) => p + (c.winner && c.winner !== game.away ? 1 : 0), 0);
    const homeTies = homeDonePriorGames.reduce((p, c) => p + (c.done && !c.winner ? 1 : 0), 0);
    const awayTies = awayDonePriorGames.reduce((p, c) => p + (c.done && !c.winner ? 1 : 0), 0);

    const awayrecord = awayTies > 0 ? `${awayWins}-${awayLosses}-${awayTies}` : `${awayWins}-${awayLosses}`;
    const homerecord = homeTies > 0 ? `${homeWins}-${homeLosses}-${homeTies}` : `${homeWins}-${homeLosses}`;

    return db.games.update({
      where: { gid: game.gid },
      data: { awayrecord, homerecord },
    });
  });

  await db.$transaction(recordUpdates);
  console.log(`${LOG_PREFIX} ✓ Updated records for ${recordUpdates.length} games`);

  // ========================================
  // Update game start times
  // ========================================
  console.log(`${LOG_PREFIX} Checking game start times...`);

  games = await db.games.findMany({ where: { season }, orderBy: { ts: "asc" } });

  const now = new Date();
  const firstUnstartedGame = games.find((g) => g.ts > now);
  const firstUnstartedGameWeek = firstUnstartedGame?.week;

  let timesUpdated = 0;
  for (const game of games) {
    const espnGame = game.espn_id ? espnGamesById[game.espn_id]?.at(0) : undefined;
    if (
      firstUnstartedGameWeek &&
      espnGame &&
      espnGame.week.number > firstUnstartedGameWeek
    ) {
      await db.games.update({
        where: { gid: game.gid },
        data: { ts: new Date(espnGame.date) },
      });
      timesUpdated++;
    }
  }
  console.log(`${LOG_PREFIX} ✓ Updated ${timesUpdated} game start times`);

  // ========================================
  // Update tiebreaker games
  // ========================================
  console.log(`${LOG_PREFIX} Checking tiebreaker assignments...`);

  games = await db.games.findMany({ where: { season }, orderBy: { ts: "asc" } });
  const gamesByWeek = groupBy(games, (g) => g.week);
  const weeksToCheck = new Set(
    games
      .map((g) => g.week)
      .filter((week) => firstUnstartedGameWeek && week > firstUnstartedGameWeek),
  );

  let tiebreakersUpdated = 0;
  for (const week of Array.from(weeksToCheck)) {
    const weekGames = gamesByWeek[week];
    if (!weekGames?.length) continue;

    const tiebreakerGame = orderBy(weekGames, ["ts", "msf_id"], ["asc", "asc"])?.at(-1);
    const nonTiebreakerGids = weekGames
      .filter((g) => g.gid !== (tiebreakerGame ?? 0))
      .map((g) => g.gid);

    await db.games.updateMany({
      where: { gid: { in: nonTiebreakerGids } },
      data: { is_tiebreaker: false },
    });

    if (tiebreakerGame) {
      await db.games.update({
        where: { gid: tiebreakerGame.gid },
        data: { is_tiebreaker: true },
      });
      tiebreakersUpdated++;
    }
  }
  console.log(`${LOG_PREFIX} ✓ Updated tiebreakers for ${tiebreakersUpdated} weeks`);

  // ========================================
  // Sync postseason data (seeds + games)
  // ========================================
  try {
    await syncPostseason(season);
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Error in postseason sync:`, error);
  }

  // ========================================
  // Send pick reminders
  // ========================================
  console.log(`${LOG_PREFIX} Checking pick reminders...`);

  const upcomingWeek = firstUnstartedGameWeek;
  let remindersSent = 0;

  if (upcomingWeek && firstUnstartedGame && addHours(now, 3) >= firstUnstartedGame.ts) {
    const membersNeedingReminder = await db.leaguemembers.findMany({
      where: {
        leagues: { reminder_policy: "three_hours_before", season: DEFAULT_SEASON },
        picks: { none: { week: upcomingWeek } },
        EmailLogs: { none: { email_type: "week_reminder", week: upcomingWeek } },
      },
      include: { people: true },
    });

    if (membersNeedingReminder.length > 0) {
      const reminderLeagues = await db.leagues.findMany({
        where: { league_id: { in: [...new Set(membersNeedingReminder.map((p) => p.league_id))] } },
      });

      const memberChunks = chunk(membersNeedingReminder, 100);
      for (const memberChunk of memberChunks) {
        await Promise.all(
          memberChunk.map(async (member) => {
            await resendApi.sendPickReminderEmail({
              member,
              user: member.people,
              league: reminderLeagues.find((l) => l.league_id === member.league_id)!,
              week: upcomingWeek,
            });
            remindersSent++;
          }),
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  console.log(`${LOG_PREFIX} ✓ Sent ${remindersSent} pick reminders`);

  // ========================================
  // Done!
  // ========================================
  const duration = Math.round((Date.now() - _startTime) / 1000);
  console.log(`\n${"=".repeat(50)}`);
  console.log(`${LOG_PREFIX} ✓ Cron finished successfully in ${duration}s`);
  console.log(`${"=".repeat(50)}\n`);
}

await run().catch((e) => {
  console.error("error running cron", e);
  process.exit(1);
});

process.exit(0);

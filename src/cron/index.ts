import { groupBy } from "lodash";
import { db } from "~/server/db";
import { msf } from "~/server/services/mysportsfeeds";
import { DEFAULT_SEASON } from "~/utils/const";

async function run() {
  console.log("starting cron...");

  const season = DEFAULT_SEASON;

  const msfGames = await msf.getGamesBySeason({ season });
  const games = await db.games.findMany({
    where: {
      season,
    },
  });
  const teams = await db.teams.findMany();
  const teamByAbbrev = groupBy(teams, (t) => t.abbrev);

  const gamesByMsfId = groupBy(games, (g) => g.msf_id);

  for (const msfGame of msfGames) {
    const game = gamesByMsfId[msfGame.schedule.id]?.at(0);
    const awayTeam =
      teamByAbbrev[msfGame.schedule.awayTeam.abbreviation]?.at(0);
    const homeTeam =
      teamByAbbrev[msfGame.schedule.homeTeam.abbreviation]?.at(0);
    if (!awayTeam || !homeTeam || !game || game.done) {
      continue;
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
      } else if (msfGame.score.awayScoreTotal > msfGame.score.homeScoreTotal) {
        winner = game.away;
      }
    }
    const data = {
      awayscore: msfGame.score.awayScoreTotal,
      homescore: msfGame.score.homeScoreTotal,
      done,
      winner,
    } satisfies Parameters<typeof db.games.update>[0]["data"];

    console.log(
      `going to update game ${game.gid} with data ${JSON.stringify(data)}`,
    );

    await db.games.update({
      where: {
        gid: game.gid,
      },
      data,
    });
  }

  // update picks

  // update game records

  // update startTimes (should do it for weeks even that have picks?)

  // for weeks that don't have picks yet, update is_tiebreaker if needed

  console.log(`found ${games.length} games and ${msfGames.length} MSF games`);
}

await run().catch((e) => {
  console.error("error running cron", e);
  process.exit(1);
});

process.exit(0);

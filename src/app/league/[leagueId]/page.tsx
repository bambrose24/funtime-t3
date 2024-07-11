import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientLeaguePage } from "./client-league-page";
import { NotStartedLeaguePage } from "./not-started/NotStartedLeaguePage";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    leagueId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LeaguePage({
  params: { leagueId: leagueIdParam },
  searchParams,
}: Props) {
  const leagueId = Number(leagueIdParam);
  const weekParam = searchParams?.week;

  const session = await serverApi.session.current();
  const member = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );

  console.log("member?", member);

  if (!member) {
    // not in the league
    return notFound();
  }

  const [league, activeGame] = await Promise.all([
    serverApi.league.get({ leagueId }),
    serverApi.time.activeWeekByLeague({ leagueId }),
  ]);

  const season = league.season;

  let week = Number(weekParam);
  if (!week) {
    if (!activeGame) {
      // I suppose the league hasn't started yet? idk what to do yet
      return <NotStartedLeaguePage league={league} session={session} />;
    }
    week = activeGame.week;
  }

  const [data, games, teams] = await Promise.all([
    serverApi.league.picksSummary({ leagueId, week }),
    serverApi.games.getGames({ week, season }),
    serverApi.teams.getTeams(),
  ]);

  return (
    <ClientLeaguePage
      week={week}
      leagueId={leagueId}
      season={season}
      picksSummary={data}
      teams={teams}
      games={games}
      league={league}
      session={session}
      currentGame={activeGame}
    />
  );
}

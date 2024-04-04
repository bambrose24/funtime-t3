import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientLeaguePage } from "./client-league-page";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    id: string;
  };
};

export default async function LeaguePage({ params: { id } }: Props) {
  const leagueId = Number(id);
  const session = await serverApi.session.current();
  const member = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );

  if (!member) {
    // not in the league
    return notFound();
  }

  const game = await serverApi.time.activeWeekByLeague({ leagueId });

  if (!game) {
    // I suppose the league hasn't started yet? idk what to do yet
    return notFound();
  }
  const { week, season } = game;

  const [data, games, teams, league] = await Promise.all([
    serverApi.league.picksSummary({ leagueId, week }),
    serverApi.games.getGames({ week, season }),
    serverApi.teams.getTeams(),
    serverApi.league.get({ leagueId }),
  ]);

  return (
    <ClientLeaguePage
      picksSummary={data}
      teams={teams}
      games={games}
      league={league}
      session={session}
    />
  );
}

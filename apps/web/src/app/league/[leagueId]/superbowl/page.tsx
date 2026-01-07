import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientSuperbowlPicksPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuperbowlPicksPage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdParam } = params;
  const session = await serverApi.session.current();

  const member = session?.dbUser?.leaguemembers.find(
    (m) => m.league_id.toString() === leagueIdParam,
  );
  if (!member) {
    notFound();
  }

  const [superbowlPicks, league, teams, bracket] = await Promise.all([
    serverApi.league.superbowlPicks({
      leagueId: member.league_id,
    }),
    serverApi.league.get({ leagueId: member.league_id }),
    serverApi.teams.getTeams(),
    serverApi.postseason.getBracket({ season: member.leagues.season }),
  ]);

  return (
    <ClientSuperbowlPicksPage
      league={league}
      teams={teams}
      session={session}
      superbowlPicks={superbowlPicks}
      bracket={bracket}
    />
  );
}

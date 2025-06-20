import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientSuperbowlPicksPage } from "./client-page";

type Props = {
  params: {
    leagueId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function SuperbowlPicksPage({
  params: { leagueId: leagueIdParam },
}: Props) {
  const session = await serverApi.session.current();

  const member = session?.dbUser?.leaguemembers.find(
    (m) => m.league_id.toString() === leagueIdParam,
  );
  if (!member) {
    notFound();
  }

  const [superbowlPicks, league, teams] = await Promise.all([
    serverApi.league.superbowlPicks({
      leagueId: member.league_id,
    }),
    serverApi.league.get({ leagueId: member.league_id }),
    serverApi.teams.getTeams(),
  ]);

  return (
    <ClientSuperbowlPicksPage
      league={league}
      teams={teams}
      session={session}
      superbowlPicks={superbowlPicks}
    />
  );
}

import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientMemberPage } from "../player/[memberId]/client-page";

type Props = {
  params: {
    leagueId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function MyProfilePage({
  params: { leagueId: leagueIdParam },
}: Props) {
  const session = await serverApi.session.current();

  const member = session?.dbUser?.leaguemembers.find(
    (m) => m.league_id.toString() === leagueIdParam,
  );
  if (!member) {
    notFound();
  }

  const [playerProfile, teams, league, hasLeagueStarted] = await Promise.all([
    serverApi.playerProfile.get({
      leagueId: member.league_id,
      memberId: member.membership_id,
    }),
    serverApi.teams.getTeams(),
    serverApi.league.get({ leagueId: member.league_id }),
    serverApi.league.hasStarted({ leagueId: member.league_id }),
  ]);

  // TODO make a real personalized page
  return (
    <ClientMemberPage
      leagueId={member.league_id}
      memberId={member.membership_id}
      playerProfile={playerProfile}
      league={league}
      hasLeagueStarted={hasLeagueStarted}
      teams={teams}
    />
  );
}

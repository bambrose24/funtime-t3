import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientMemberPage } from "./client-page";

// dynamic route params come in as `params` arg
type Props = {
  params: Promise<{
    leagueId: string;
    memberId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MemberPage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdParam, memberId: memberIdParam } = params;
  const leagueId = Number(leagueIdParam);
  const memberId = Number(memberIdParam);

  if (!leagueId || !memberId) {
    return notFound();
  }

  const [playerProfile, teams, league, hasLeagueStarted] = await Promise.all([
    serverApi.playerProfile.get({ leagueId, memberId }),
    serverApi.teams.getTeams(),
    serverApi.league.get({ leagueId }),
    serverApi.league.hasStarted({ leagueId }),
  ]);

  return (
    <ClientMemberPage
      leagueId={leagueId}
      memberId={memberId}
      league={league}
      playerProfile={playerProfile}
      hasLeagueStarted={hasLeagueStarted}
      teams={teams}
    />
  );
}

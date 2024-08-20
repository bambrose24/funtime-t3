import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientMemberPage } from "./client-page";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    leagueId: string;
    memberId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function MemberPage({
  params: { leagueId: leagueIdParam, memberId: memberIdParam },
}: Props) {
  const leagueId = Number(leagueIdParam);
  const memberId = Number(memberIdParam);

  if (!leagueId || !memberId) {
    return notFound();
  }

  const [playerProfile, teams, hasLeagueStarted] = await Promise.all([
    serverApi.playerProfile.get({ leagueId, memberId }),
    serverApi.teams.getTeams(),
    serverApi.league.hasStarted({ leagueId }),
  ]);

  return (
    <ClientMemberPage
      leagueId={leagueId}
      memberId={memberId}
      playerProfile={playerProfile}
      hasLeagueStarted={hasLeagueStarted}
      teams={teams}
    />
  );
}

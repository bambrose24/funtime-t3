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

  const [playerProfile, teams] = await Promise.all([
    serverApi.playerProfile.get({
      leagueId: member.league_id,
      memberId: member.membership_id,
    }),
    serverApi.teams.getTeams(),
  ]);

  // TODO make a real personalized page
  return (
    <ClientMemberPage
      leagueId={member.league_id}
      memberId={member.membership_id}
      playerProfile={playerProfile}
      teams={teams}
    />
  );
}

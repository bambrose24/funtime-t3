import { serverApi } from "~/trpc/server";
import { LeagueAdminMembersClientPage } from "./client-page";

type Props = {
  params: {
    leagueId: string;
  };
};

export default async function LeagueAdminMembersPage({
  params: { leagueId: leagueIdParam },
}: Props) {
  const leagueId = Number(leagueIdParam);
  const [members, league] = await Promise.all([
    serverApi.league.admin.members({ leagueId }),
    serverApi.league.get({ leagueId }),
  ]);

  return (
    <LeagueAdminMembersClientPage
      leagueId={leagueId}
      league={league}
      members={members}
    />
  );
}

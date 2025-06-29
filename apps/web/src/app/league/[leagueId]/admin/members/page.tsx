import { serverApi } from "~/trpc/server";
import { LeagueAdminMembersClientPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueAdminMembersPage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdParam } = params;
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

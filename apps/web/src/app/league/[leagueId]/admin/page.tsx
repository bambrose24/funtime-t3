import { serverApi } from "~/trpc/server";
import { LeagueAdminClientPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueAdminPage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdProp } = params;
  const leagueId = Number(leagueIdProp);
  const [league, members] = await Promise.all([
    serverApi.league.get({ leagueId }),
    serverApi.league.members({ leagueId }),
  ]);

  return <LeagueAdminClientPage league={league} members={members} />;
}

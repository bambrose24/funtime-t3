import { serverApi } from "~/trpc/server";
import { LeagueAdminClientPage } from "./client-page";

type Props = {
  params: {
    leagueId: string;
  };
};

export default async function LeagueAdminPage({
  params: { leagueId: leagueIdProp },
}: Props) {
  const leagueId = Number(leagueIdProp);
  const [league, members] = await Promise.all([
    serverApi.league.get({ leagueId }),
    serverApi.league.members({ leagueId }),
  ]);

  return <LeagueAdminClientPage league={league} members={members} />;
}

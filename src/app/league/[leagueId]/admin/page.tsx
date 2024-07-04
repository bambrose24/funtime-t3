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
  const league = await serverApi.league.get({ leagueId });

  return <LeagueAdminClientPage league={league} />;
}

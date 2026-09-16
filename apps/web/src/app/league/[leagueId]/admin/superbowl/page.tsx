import { serverApi } from "~/trpc/server";
import { LeagueAdminSuperbowlClientPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueAdminSuperbowlPage(props: Props) {
  const { leagueId: leagueIdParam } = await props.params;
  const leagueId = Number(leagueIdParam);
  const [initialData, teams] = await Promise.all([
    serverApi.league.admin.superbowlPicks({ leagueId }),
    serverApi.teams.getTeams(),
  ]);

  return (
    <LeagueAdminSuperbowlClientPage
      leagueId={leagueId}
      initialData={initialData}
      teams={teams}
    />
  );
}

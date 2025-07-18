import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientPickPage } from "./client-pick-page";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// dynamic route params come in as `params` arg
type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PickPage(props: Props) {
  const params = await props.params;
  const { leagueId: id } = params;
  const leagueId = Number.isInteger(Number(id)) ? Number(id) : null;

  if (!leagueId) {
    return notFound();
  }
  const [weekToPick, teams, league] = await Promise.all([
    serverApi.league.weekToPick({
      leagueId,
    }),
    serverApi.teams.getTeams(),
    serverApi.league.get({ leagueId }),
  ]);

  if (!weekToPick.week) {
    return <SeasonOver />;
  }
  const existingPicks = await serverApi.member.picksForWeek({
    leagueId,
    week: weekToPick.week,
  });

  return (
    <ClientPickPage
      league={league}
      weekToPick={weekToPick}
      teams={teams}
      existingPicks={existingPicks}
    />
  );
}

function SeasonOver() {
  return (
    <div className="col-span-12 flex w-full justify-center">
      <Card>
        <CardHeader>
          <CardTitle>The season is over</CardTitle>
          <CardDescription>
            Thanks for playing, there are no more games to pick.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

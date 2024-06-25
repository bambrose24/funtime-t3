import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientPickPage } from "./client-pick-page";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    leagueId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function PickPage({ params: { leagueId: id } }: Props) {
  const leagueId = Number.isInteger(Number(id)) ? Number(id) : null;

  if (!leagueId) {
    return notFound();
  }
  const [weekToPick, teams] = await Promise.all([
    serverApi.league.weekToPick({
      leagueId,
    }),
    serverApi.teams.getTeams(),
  ]);

  return (
    <ClientPickPage leagueId={leagueId} weekToPick={weekToPick} teams={teams} />
  );
}

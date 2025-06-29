import { serverApi } from "~/trpc/server";
import { ClientLeaderboardPage } from "./client-leaderboard-page";

// dynamic route params come in as `params` arg
type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Leaderboard(props: Props) {
  const params = await props.params;
  const { leagueId: id } = params;
  const leagueId = Number(id);
  const res = await serverApi.leaderboard.league({ leagueId });
  return <ClientLeaderboardPage leagueId={leagueId} leaderboard={res} />;
}

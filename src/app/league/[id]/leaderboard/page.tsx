import { serverApi } from "~/trpc/server";
import { ClientLeaderboardPage } from "./client-leaderboard-page";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Leaderboard({ params: { id } }: Props) {
  const leagueId = Number(id);
  const res = await serverApi.leaderboard.league({ leagueId });
  return <ClientLeaderboardPage leaderboard={res} />;
}
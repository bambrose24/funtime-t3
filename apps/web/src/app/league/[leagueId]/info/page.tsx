import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientLeagueInfoPage } from "./client-page";

type Props = {
  params: {
    leagueId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function MyProfilePage({
  params: { leagueId: leagueIdParam },
}: Props) {
  const leagueId = Number(leagueIdParam);
  if (!leagueId) {
    notFound();
  }

  const session = await serverApi.session.current();

  const member = session?.dbUser?.leaguemembers.find(
    (m) => m.league_id.toString() === leagueIdParam,
  );
  if (!member) {
    notFound();
  }

  const [league, members] = await Promise.all([
    serverApi.league.get({ leagueId }),
    serverApi.league.members({ leagueId }),
  ]);

  return <ClientLeagueInfoPage league={league} members={members} />;
}

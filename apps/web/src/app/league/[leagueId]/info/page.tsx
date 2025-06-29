import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientLeagueInfoPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyProfilePage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdParam } = params;
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

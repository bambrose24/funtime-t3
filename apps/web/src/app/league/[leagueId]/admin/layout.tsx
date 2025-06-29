import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { Text } from "~/components/ui/text";
import { MobileAdminNav } from "./mobile-admin-nav";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  children: React.ReactNode;
};

export default async function LeagueAdminPage(props: Props) {
  const params = await props.params;
  const { leagueId: leagueIdParam } = params;
  const leagueId = Number(leagueIdParam);
  const [session, league] = await Promise.all([
    serverApi.session.current(),
    serverApi.league.get({ leagueId }),
  ]);

  if (
    !session.dbUser ||
    !league ||
    session.dbUser.leaguemembers.find((m) => m.league_id === league.league_id)
      ?.role !== "admin"
  ) {
    notFound();
  }

  return (
    <div className="col-span-12 flex w-full flex-col justify-center gap-2 px-2 py-4 md:col-span-12">
      <div className="col-span-5 flex flex-col items-center">
        <Text.H2>{league.name} — Admin</Text.H2>
      </div>
      <div>
        <MobileAdminNav leagueId={league.league_id} />
      </div>
      {props.children}
    </div>
  );
}

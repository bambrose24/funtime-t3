import { notFound } from "next/navigation";
import { MemberRole } from "~/generated/prisma-client";
import { serverApi } from "~/trpc/server";
import { Text } from "~/components/ui/text";
import { AdminNav } from "./admin-nav";

type Props = {
  params: {
    leagueId: string;
  };
  children: React.ReactNode;
};

export default async function LeagueAdminPage({
  params: { leagueId: leagueIdParam },
  children,
}: Props) {
  const leagueId = Number(leagueIdParam);
  const [session, league] = await Promise.all([
    serverApi.session.current(),
    serverApi.league.get({ leagueId }),
  ]);
  if (
    !session.dbUser ||
    !league ||
    session.dbUser.leaguemembers.find((m) => m.league_id === league.league_id)
      ?.role !== MemberRole.admin
  ) {
    notFound();
  }

  return (
    <div className="col-span-12 grid w-full grid-cols-5 justify-center gap-2 py-4 md:col-span-10 md:col-start-2">
      <div className="col-span-5 flex justify-center">
        <Text.H2>{league.name} — Admin Settings</Text.H2>
      </div>
      <div className="col-span-1 hidden flex-col lg:flex">
        <AdminNav leagueId={league.league_id} />
      </div>
      <div className="col-span-5 lg:col-span-4">{children}</div>
    </div>
  );
}

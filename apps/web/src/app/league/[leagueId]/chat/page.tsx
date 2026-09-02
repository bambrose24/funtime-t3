import { notFound } from "next/navigation";
import { LeagueChat } from "~/components/messages/LeagueChat";
import { serverApi } from "~/trpc/server";

export default async function LeagueChatPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId: leagueIdParam } = await params;
  const leagueId = Number(leagueIdParam);
  if (!Number.isInteger(leagueId)) {
    notFound();
  }

  const session = await serverApi.session.current();
  const member = session.dbUser?.leaguemembers.find(
    (leagueMember) => leagueMember.league_id === leagueId,
  );
  if (!member) {
    notFound();
  }

  const league = await serverApi.league.get({ leagueId });
  return (
    <div className="col-span-12 py-3 sm:py-6">
      <LeagueChat leagueId={leagueId} leagueName={league.name} />
    </div>
  );
}

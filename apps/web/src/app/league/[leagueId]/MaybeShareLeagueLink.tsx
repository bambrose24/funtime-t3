import { Suspense } from "react";
import { serverApi } from "~/trpc/server";
import { ShareLeagueLinkClient } from "./ShareLeagueLinkClient";

export async function MaybeShareLeagueLink({ leagueId }: { leagueId: number }) {
  return (
    <Suspense fallback={null}>
      <MaybeShareLeagueLinkContent leagueId={leagueId} />
    </Suspense>
  );
}

async function MaybeShareLeagueLinkContent({ leagueId }: { leagueId: number }) {
  const [session, league] = await Promise.all([
    serverApi.session.current(),
    serverApi.league.get({ leagueId }),
  ]);

  // Check if user is an admin of this league
  const member = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );

  if (!member || member.role !== "admin") {
    return null;
  }

  // Check if league hasn't started
  if (league.status !== "not_started") {
    return null;
  }

  // Check if share_code exists
  if (!league.share_code) {
    return null;
  }

  return <ShareLeagueLinkClient shareCode={league.share_code} />;
}

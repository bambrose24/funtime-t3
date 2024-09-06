import { serverApi } from "~/trpc/server";
import { AlreadyInLeague } from "./AlreadyInLeague";
import { JoinLeagueClientPage } from "./client-page";
import { notFound, redirect } from "next/navigation";
import { TRPCError } from "@trpc/server";

type Props = {
  params: {
    code: string;
  };
};

export default async function JoinLeaguePage(props: Props) {
  const { code } = props.params;

  const [league, session] = await Promise.all([
    serverApi.league.fromJoinCode({ code }),
    serverApi.session.current(),
  ]);

  if (!league) {
    notFound();
  }

  if (!session.dbUser) {
    redirect(`/login?upsell=registration&redirectTo=/join-league/${code}`);
  }

  const [hasStarted, teams] = await Promise.all([
    serverApi.league.hasStarted({
      leagueId: league?.league_id,
    }),
    serverApi.teams.getTeams(),
  ]);

  const isInLeague = session.dbUser?.leaguemembers?.find(
    (m) => m.league_id === league.league_id,
  );
  if (isInLeague) {
    return <AlreadyInLeague data={league} />;
  }

  if (hasStarted) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not allowed to join now that the league has started",
    });
  }

  return <JoinLeagueClientPage data={league} session={session} teams={teams} />;
}

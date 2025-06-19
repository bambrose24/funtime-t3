import { serverApi } from "~/trpc/server";
import { AlreadyInLeague } from "./AlreadyInLeague";
import { JoinLeagueClientPage } from "./client-page";
import { notFound, redirect } from "next/navigation";

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
  const teams = await serverApi.teams.getTeams();
  const isInLeague = session.dbUser?.leaguemembers?.find(
    (m) => m.league_id === league.league_id,
  );
  if (isInLeague) {
    return <AlreadyInLeague data={league} />;
  }

  return <JoinLeagueClientPage data={league} session={session} teams={teams} />;
}

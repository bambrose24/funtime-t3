import { serverApi } from "~/trpc/server";
import { AlreadyInLeague } from "./AlreadyInLeague";
import { JoinLeagueClientPage } from "./client-page";

type Props = {
  params: {
    code: string;
  };
};

export default async function JoinLeaguePage(props: Props) {
  const { code } = props.params;

  const [league, session, teams] = await Promise.all([
    serverApi.league.fromJoinCode({ code }),
    serverApi.session.current(),
    serverApi.teams.getTeams(),
  ]);

  if (!league) {
    return <div>League not found</div>;
  }
  const isInLeague = session.dbUser?.leaguemembers?.find(
    (m) => m.league_id === league.league_id,
  );
  if (isInLeague) {
    return <AlreadyInLeague data={league} />;
  }

  return <JoinLeagueClientPage data={league} session={session} teams={teams} />;
}

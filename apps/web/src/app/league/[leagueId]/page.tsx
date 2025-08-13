import { notFound } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ClientLeaguePage } from "./client-league-page";
import { NotStartedLeaguePage } from "./not-started/NotStartedLeaguePage";

// dynamic route params come in as `params` arg
type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeaguePage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { leagueId: leagueIdParam } = params;
  const leagueId = Number(leagueIdParam);
  const weekParam = searchParams?.week;

  const session = await serverApi.session.current();
  const member = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );

  if (!member) {
    // not in the league
    return notFound();
  }

  const [league, activeGame] = await Promise.all([
    serverApi.league.get({ leagueId }),
    serverApi.time.activeWeekByLeague({ leagueId }),
  ]);

  const [picks] = await Promise.all([
    serverApi.member.picksForWeek({
      leagueId,
      week: activeGame?.week ?? 1,
    }),
  ]);

  const season = league.season;

  let week = Number(weekParam);
  if (!week) {
    if (!activeGame && !picks.length) {
      // TODO show the regular page if the person has made a pick, but hide picks table
      return <NotStartedLeaguePage league={league} session={session} />;
    }
    week = activeGame?.week ?? picks.at(0)?.week ?? 1;
  }

  const viewerMember = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === leagueId,
  );

  const [data, games, teams, weekWinners, weeksWithPicks] = await Promise.all([
    serverApi.league.picksSummary({ leagueId, week }),
    serverApi.games.getGames({ week, season }),
    serverApi.teams.getTeams(),
    serverApi.league.weekWinners({ week, leagueId }),
    serverApi.picks.weeksWithPicks({ leagueId }),
  ]);

  const viewerHasPicks =
    Boolean(viewerMember) &&
    (data.find((p1) => p1.membership_id === viewerMember?.membership_id)?.picks
      ?.length ?? 0) > 0;

  return (
    <ClientLeaguePage
      week={week}
      leagueId={leagueId}
      season={season}
      picksSummary={data}
      teams={teams}
      games={games}
      league={league}
      session={session}
      currentGame={activeGame}
      viewerHasPicks={viewerHasPicks}
      weekWinners={weekWinners}
      weeksWithPicks={weeksWithPicks}
    />
  );
}

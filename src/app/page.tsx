import { type AppConfigDynamic } from "next/dist/build/utils";
import { HomeLeagueCard } from "~/components/home/HomeLeagueCard";
import { serverApi } from "~/trpc/server";
import { JoinOrCreateALeague } from "./JoinOrCreateALeague";
import { DEFAULT_SEASON } from "~/utils/const";
import { redirect } from "next/navigation";
import { FuntimeWelcomeCard } from "./FuntimeWelcomeCard";
import { Text } from "~/components/ui/text";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const [session] = await Promise.all([serverApi.session.current()]);

  if (!session.dbUser) {
    return (
      <div className="col-span-12 flex justify-center">
        <FuntimeWelcomeCard />
      </div>
    );
    redirect("/login");
  }

  const activeLeagues =
    session?.dbUser?.leaguemembers?.filter(
      (m) => m.leagues.season === DEFAULT_SEASON,
    ) ?? [];

  if (activeLeagues.length === 1) {
    const activeLeague = activeLeagues.at(0);
    if (activeLeague) {
      redirect(`/league/${activeLeague.league_id}`);
    }
  }

  const data = await serverApi.home.summary();

  const thisSeasonLeagues = data?.filter((l) => l.season === DEFAULT_SEASON);
  const priorLeagues = data?.filter((l) => l.season !== DEFAULT_SEASON);

  return (
    <>
      {!data?.length ? <JoinOrCreateALeague /> : <></>}
      <div className="col-span-12 flex justify-center">
        <Text.H2>Active Leagues</Text.H2>
      </div>

      <div className="col-span-12 flex w-full flex-row flex-wrap justify-center gap-4 py-4">
        {!thisSeasonLeagues || thisSeasonLeagues.length === 0 ? (
          <Text.Body>
            No active leagues for the {DEFAULT_SEASON} season.
          </Text.Body>
        ) : null}
        {thisSeasonLeagues?.map((d) => {
          if (!d) {
            return null;
          }
          return <HomeLeagueCard key={d.league_id} data={d} />;
        })}
      </div>

      {priorLeagues?.length ? (
        <>
          <div className="col-span-12 flex justify-center">
            <Text.H2>Prior Leagues</Text.H2>
          </div>
          <div className="col-span-12 flex w-full flex-row flex-wrap justify-center gap-4 py-4">
            {priorLeagues.map((d) => {
              if (!d) {
                return null;
              }
              return <HomeLeagueCard key={d.league_id} data={d} />;
            })}
          </div>
        </>
      ) : null}
    </>
  );
}

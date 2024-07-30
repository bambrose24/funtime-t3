import { type AppConfigDynamic } from "next/dist/build/utils";
import { HomeLeagueCard } from "~/components/home/HomeLeagueCard";
import { serverApi } from "~/trpc/server";
import { JoinOrCreateALeague } from "./JoinOrCreateALeague";
import { DEFAULT_SEASON } from "~/utils/const";
import { redirect } from "next/navigation";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const [data, session] = await Promise.all([
    serverApi.home.summary(),
    serverApi.session.current(),
  ]);

  if (!session) {
    redirect("/login");
  }

  const activeLeagues = data?.filter((l) => l.season === DEFAULT_SEASON) ?? [];
  if (activeLeagues.length === 1) {
    const activeLeague = activeLeagues.at(0);
    if (activeLeague) {
      redirect(`/league/${activeLeague.league_id}`);
    }
  }

  return (
    <div className="col-span-12 flex w-full grow flex-row flex-wrap justify-around gap-4 py-4">
      {data?.map((d) => {
        if (!d) {
          return null;
        }
        return <HomeLeagueCard key={d.league_id} data={d} />;
      })}
      {!data?.length ? <JoinOrCreateALeague /> : <></>}
    </div>
  );
}

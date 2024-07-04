import { type AppConfigDynamic } from "next/dist/build/utils";
import { HomeLeagueCard } from "~/components/home/HomeLeagueCard";
import { serverApi } from "~/trpc/server";
import { JoinOrCreateALeague } from "./JoinOrCreateALeague";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const [data] = await Promise.all([serverApi.home.summary()]);

  return (
    <div className="col-span-12 flex w-full grow flex-row flex-wrap justify-around gap-4 py-4">
      {data?.map((d) => {
        if (!d) {
          return null;
        }
        return <HomeLeagueCard key={d.league?.league_id} data={d} />;
      })}
      {!data?.length ? <JoinOrCreateALeague /> : <></>}
    </div>
  );
}

import { type AppConfigDynamic } from "next/dist/build/utils";
import { HomeLeagueCard } from "~/components/home/HomeLeagueCard";
import { serverApi } from "~/trpc/server";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const data = await serverApi.home.summary({ season: 2023 });

  return (
    <main className="h-full w-full px-3">
      <div className="flex w-full flex-row flex-wrap justify-around gap-4 py-4">
        {data?.map((d) => {
          if (!d) {
            return null;
          }
          return <HomeLeagueCard key={d.league_id} data={d} />;
        })}
      </div>
    </main>
  );
}

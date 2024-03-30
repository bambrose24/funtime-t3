import { type AppConfigDynamic } from "next/dist/build/utils";
import { serverApi } from "~/trpc/server";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const gamesCount = await serverApi.home.summary({ season: 2023 });

  return (
    <main className="h-full w-full">
      <div className="w-full justify-center">{gamesCount} games!</div>
    </main>
  );
}

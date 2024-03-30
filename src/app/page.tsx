import { AppConfigDynamic } from "next/dist/build/utils";
import { api } from "~/trpc/server";

// Almost all of the Funtime pages will need this
export const dynamic: AppConfigDynamic = "force-dynamic";

export default async function Home() {
  const gamesCount = await api.home.summary({ season: 2023 });
  console.log("how many games in Home page?", gamesCount);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full justify-center">{gamesCount} games!</div>
    </main>
  );
}

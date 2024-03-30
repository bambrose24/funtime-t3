import { api } from "~/trpc/server";

export default async function Home() {
  const games = await api.home.summary({ season: 2023 });
  console.log("how many games in Home page?", games.length);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="w-full justify-center">{games.length} games!</div>
    </main>
  );
}

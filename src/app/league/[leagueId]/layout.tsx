import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";

export default async function LeagueAuthLayout({
  children,
  params: { leagueId },
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  console.log("hiii");
  try {
    const league = await serverApi.league.get({ leagueId: Number(leagueId) });
    if (!league) {
      throw new Error("Cannot find league");
    }
  } catch (e) {
    redirect("/");
  }
  return children;
}
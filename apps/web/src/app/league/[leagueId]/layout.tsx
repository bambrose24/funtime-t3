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
  try {
    const league = await serverApi.league.get({ leagueId: Number(leagueId) });
    if (!league) {
      throw new Error("Cannot find league");
    }
  } catch (e) {
    console.error("Error getting league", e);
    redirect("/");
  }
  return children;
}

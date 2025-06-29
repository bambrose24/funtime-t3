import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";

export default async function LeagueAuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    leagueId: string;
  }>;
}) {
  const resolvedParams = await params;
  const { leagueId } = resolvedParams;
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

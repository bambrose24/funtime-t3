import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { MaybeUpsellNextLeague } from "./MaybeUpsellNextLeague";

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
  const leagueIdNumber = Number(leagueId);
  try {
    const league = await serverApi.league.get({ leagueId: leagueIdNumber });
    if (!league) {
      throw new Error("Cannot find league");
    }
  } catch (e) {
    console.error("Error getting league", e);
    redirect("/");
  }
  return (
    <>
      <MaybeUpsellNextLeague leagueId={leagueIdNumber} />
      {children}
    </>
  );
}

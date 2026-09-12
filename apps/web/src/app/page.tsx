import { redirect } from "next/navigation";
import Link from "next/link";
import { serverApi } from "~/trpc/server";
import { DEFAULT_SEASON } from "~/utils/const";
import { FuntimeLanding } from "./_components/FuntimeLanding";
import { HomeLeagues } from "~/components/home/HomeLeagues";
import { JoinOrCreateALeague } from "./JoinOrCreateALeague";
import { NextSeasonRenewalSection } from "./NextSeasonRenewalSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await serverApi.session.current();
  if (!session.dbUser && session.supabaseUser) redirect("/confirm-signup");
  if (!session.dbUser) {
    return (
      <div className="col-span-12 flex justify-center">
        <FuntimeLanding />
      </div>
    );
  }

  const [leagues, renewalCandidates] = await Promise.all([
    // A failed initial read falls back to the client's loading/retry state.
    serverApi.home.leagues().catch(() => undefined),
    serverApi.league.renewalCandidates(),
  ]);

  return (
    <main className="col-span-12 mx-auto w-full max-w-4xl px-3 pb-16 pt-6 sm:px-6 sm:pt-10">
      <header className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My leagues</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {DEFAULT_SEASON} season
          </p>
        </div>
        <Link
          href="/league/create"
          className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          Create league
        </Link>
      </header>
      <HomeLeagues initialData={leagues}>
        <NextSeasonRenewalSection candidates={renewalCandidates} />
      </HomeLeagues>
      <JoinOrCreateALeague />
    </main>
  );
}

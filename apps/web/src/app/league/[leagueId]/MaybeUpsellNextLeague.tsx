import Link from "next/link";
import { Suspense } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { serverApi } from "~/trpc/server";

export async function MaybeUpsellNextLeague({
  leagueId,
}: {
  leagueId: number;
}) {
  return (
    <Suspense fallback={null}>
      <MaybeUpsellNextLeagueContent leagueId={leagueId} />
    </Suspense>
  );
}

async function MaybeUpsellNextLeagueContent({
  leagueId,
}: {
  leagueId: number;
}) {
  const league = await serverApi.league.nextLeague({ leagueId });
  if (!league.nextLeague) {
    return null;
  }

  const { nextLeague } = league;

  if (nextLeague.status !== "not_started") {
    return null;
  }

  // If I just return this, the hydration error goes away
  // return <>hi</>;

  return (
    <div className="col-span-12 flex justify-center">
      <div>
        <Alert className="flex w-full items-center border-primary bg-primary/5">
          <AlertDescription>
            <div className="flex items-center justify-between gap-2">
              <span>
                Don&apos;t miss out on the next season! Join &ldquo;
                {nextLeague.name}
                &rdquo; before it starts:
              </span>
              <Link href={`/join-league/${nextLeague.share_code}`}>
                <Button size="sm" className="ml-4 shrink-0">
                  Join League
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

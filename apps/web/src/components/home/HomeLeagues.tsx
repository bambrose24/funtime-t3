"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { clientApi } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/types";
import { DEFAULT_SEASON } from "~/utils/const";
import { Button } from "~/components/ui/button";

type HomeData = RouterOutputs["home"]["leagues"];
type League = NonNullable<HomeData>[number];

const statusLabels = {
  submitted: "Picks are in",
  needed: "Picks needed",
  closed: "Picks not submitted · Closed",
  no_schedule: "Waiting for the schedule",
  season_over: "Season complete",
};

export function HomeLeagues({
  initialData,
  children,
}: {
  initialData?: HomeData;
  children?: ReactNode;
}) {
  const { data, isPending, isError, refetch, isFetching } =
    clientApi.home.leagues.useQuery(undefined, {
      initialData,
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchInterval: 60_000,
    });
  const active =
    data?.filter((league) => league.season === DEFAULT_SEASON) ?? [];
  const prior = data?.filter((league) => league.season < DEFAULT_SEASON) ?? [];
  const upcoming =
    data?.filter((league) => league.season > DEFAULT_SEASON) ?? [];
  const needed = active.filter(
    (league) => league.weeklyStatus?.state === "needed",
  ).length;

  return (
    <>
      <section aria-labelledby="active-leagues-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="active-leagues-heading" className="text-sm font-medium">
            Active leagues
          </h2>
          {!isError && needed > 0 && (
            <p className="text-sm text-muted-foreground">
              {needed === 1
                ? "1 league needs picks"
                : `${needed} leagues need picks`}
            </p>
          )}
        </div>
        {isError && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <p>
              Couldn&apos;t refresh your leagues. Pick status is unavailable.
            </p>
            <Button
              variant="outline"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              {isFetching ? "Retrying…" : "Try again"}
            </Button>
          </div>
        )}
        {isPending ? (
          <div
            role="status"
            className="border-y border-border py-8 text-sm text-muted-foreground"
          >
            Loading your leagues…
          </div>
        ) : active.length ? (
          <ul className="divide-y divide-border border-y border-border">
            {active.map((league) => (
              <LeagueRow
                key={league.league_id}
                league={league}
                statusUnavailable={isError}
              />
            ))}
          </ul>
        ) : !isError ? (
          <div className="border-y border-border py-8">
            <p className="font-medium">No leagues for this season yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Join a league with a friend&apos;s invite link or code.
            </p>
          </div>
        ) : null}
      </section>
      {children}
      {upcoming.length > 0 && (
        <section aria-label="Upcoming seasons" className="mt-8">
          <h2 className="mb-3 text-sm font-medium">Upcoming seasons</h2>
          <ul className="divide-y divide-border border-y border-border">
            {upcoming.map((league) => (
              <li key={league.league_id}>
                <Link
                  href={`/league/${league.league_id}`}
                  className="flex min-h-14 items-center gap-4 py-3 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="text-sm text-muted-foreground">
                    {league.season}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium">
                    {league.name}
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {prior.length > 0 && (
        <details className="group mt-8" aria-label="Past seasons">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 -rotate-90 group-open:rotate-0"
            />
            Past seasons <span className="tabular-nums">({prior.length})</span>
          </summary>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {prior.map((league) => (
              <li key={league.league_id}>
                <Link
                  href={`/league/${league.league_id}`}
                  className="flex min-h-14 items-center gap-4 py-3 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {league.season}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium">
                    {league.name}
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function LeagueRow({
  league,
  statusUnavailable,
}: {
  league: League;
  statusUnavailable: boolean;
}) {
  const status = statusUnavailable ? null : league.weeklyStatus;
  const needsPicks = status?.state === "needed";
  const submitted = status?.state === "submitted";
  const action = needsPicks
    ? "Make picks"
    : submitted
      ? "View picks"
      : "Open league";
  const href = needsPicks
    ? `/league/${league.league_id}/pick`
    : submitted
      ? `/league/${league.league_id}?week=${status.week}`
      : `/league/${league.league_id}`;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-x-6 sm:py-6">
      <Link
        href={`/league/${league.league_id}`}
        className="col-span-2 min-w-0 break-words text-lg font-medium leading-snug underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:col-span-1"
      >
        {league.name}
      </Link>
      <div className="min-w-0">
        <p className="flex items-start gap-1.5 text-sm">
          {submitted && (
            <Check
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            />
          )}
          <span
            className={needsPicks ? "font-medium" : "text-muted-foreground"}
          >
            {status ? statusLabels[status.state] : "Status unavailable"}
          </span>
        </p>
        {status?.week != null && (
          <p className="mt-1 text-xs text-muted-foreground">
            Week {status.week}
          </p>
        )}
      </div>
      <Link
        href={href}
        aria-label={`${action} for ${league.name}`}
        className={`inline-flex min-h-11 items-center justify-end gap-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${needsPicks ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
      >
        {action}
        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      </Link>
    </li>
  );
}

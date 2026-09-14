"use client";

import Link from "next/link";
import { useState } from "react";
import { TeamLogo } from "~/components/shared/TeamLogo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { cn } from "~/lib/utils";
import { useUserEnforced } from "~/utils/hooks/useUserEnforced";
import { EditSuperbowlForm } from "./EditSuperbowlForm";

type Props = {
  leagueId: number;
  memberId: number;
  playerProfile: RouterOutputs["playerProfile"]["get"];
  hasLeagueStarted: RouterOutputs["league"]["hasStarted"];
  league: RouterOutputs["league"]["get"];
  teams: RouterOutputs["teams"]["getTeams"];
};

type Profile = RouterOutputs["playerProfile"]["get"];
type WeekRecord = Profile["weeks"][number];

function formatRecord(profile: Profile) {
  if (profile.decidedGames === 0) {
    return "—";
  }
  if (profile.missedPicks > 0) {
    return `${profile.correctPicks}–${profile.wrongPicks}–${profile.missedPicks}`;
  }
  return `${profile.correctPicks}–${profile.wrongPicks}`;
}

function formatRank(profile: Profile) {
  if (profile.rank == null) {
    return "—";
  }
  return profile.tiedForRank ? `T-${profile.rank}` : `#${profile.rank}`;
}

function vsFirstValue(profile: Profile) {
  if (profile.rank == null) {
    return "—";
  }
  if (profile.correctBehind === 0) {
    return profile.tiedForRank ? "Tied" : "Lead";
  }
  return `${profile.correctBehind} back`;
}

function weekCellLabel(week: WeekRecord) {
  const parts = [
    `Week ${week.week}: ${week.correct} of ${week.possible} correct`,
  ];
  if (week.missed > 0) {
    parts.push(`${week.missed} missed`);
  }
  if (week.won) {
    parts.push("won the week");
  }
  return parts.join(", ");
}

export function ClientMemberPage({
  leagueId,
  memberId,
  playerProfile: initialPlayerProfile,
  hasLeagueStarted: hasLeagueStartedProp,
  league: initialLeague,
  teams: initialTeams,
}: Props) {
  const user = useUserEnforced();
  const isViewer = user.dbUser.leaguemembers.some(
    (membership) => membership.membership_id === memberId,
  );

  const [editSuperBowlOpen, setEditSuperBowlOpen] = useState(false);

  const { data: playerProfile } = clientApi.playerProfile.get.useQuery(
    {
      leagueId,
      memberId,
    },
    {
      initialData: initialPlayerProfile,
    },
  );

  const { data: league } = clientApi.league.get.useQuery(
    {
      leagueId,
    },
    { initialData: initialLeague },
  );

  const { data: hasLeagueStarted } = clientApi.league.hasStarted.useQuery(
    {
      leagueId,
    },
    {
      initialData: hasLeagueStartedProp,
    },
  );

  const { data: teams } = clientApi.teams.getTeams.useQuery(undefined, {
    initialData: initialTeams,
  });

  const superbowl = playerProfile.member.superbowl.at(0);
  const superbowlWinner = teams.find(
    (team) => team.teamid === superbowl?.winner,
  );
  const superbowlLoser = teams.find((team) => team.teamid === superbowl?.loser);
  const weekWins = playerProfile.weeks.filter((week) => week.won);
  const canEditSuperbowl =
    isViewer &&
    league.superbowl_competition === true &&
    hasLeagueStarted !== true &&
    !playerProfile.superbowlPickHidden;

  const stats = [
    {
      label: "Correct",
      value:
        playerProfile.decidedGames > 0
          ? playerProfile.correctPicks.toString()
          : "—",
    },
    {
      label: "Record",
      value: formatRecord(playerProfile),
    },
    {
      label: "Hit rate",
      value:
        playerProfile.accuracyPct != null
          ? `${playerProfile.accuracyPct}%`
          : "—",
    },
    {
      label: "Vs first",
      value: vsFirstValue(playerProfile),
    },
  ];

  return (
    <div className="col-span-12 flex w-full justify-center py-4 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
      <div className="flex w-full flex-col gap-6">
        <header className="border-b pb-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {league.name}
            <span className="mx-2 text-border">/</span>
            {league.season}
          </p>
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight">
              {playerProfile.member.people.username}
            </h1>
            <p className="shrink-0 tabular-nums">
              <span className="text-2xl font-semibold tracking-tight">
                {formatRank(playerProfile)}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                of {playerProfile.leagueSize}
              </span>
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isViewer ? <Badge variant="secondary">You</Badge> : null}
            {playerProfile.member.role === "admin" ? (
              <Badge variant="outline">Commissioner</Badge>
            ) : null}
            <Link
              href={`/league/${leagueId}/leaderboard`}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Full standings
            </Link>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y py-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium">Week by week</h2>
            <p className="text-xs text-muted-foreground">
              {weekWins.length === 0
                ? "No week wins yet"
                : `${weekWins.length} win${weekWins.length === 1 ? "" : "s"} · ${weekWins
                    .map((week) => week.week)
                    .join(", ")}`}
            </p>
          </div>
          {playerProfile.weeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Completed weeks will land here as a box score.
            </p>
          ) : (
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1">
              {playerProfile.weeks.map((week) => (
                <li key={week.week}>
                  <div
                    title={weekCellLabel(week)}
                    aria-label={weekCellLabel(week)}
                    className={cn(
                      "flex flex-col items-center rounded-md px-1 py-1.5",
                      week.won
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/50 text-foreground",
                    )}
                  >
                    <span className="text-[10px] font-medium leading-none text-muted-foreground">
                      {week.week}
                    </span>
                    <span className="mt-1 text-sm font-semibold tabular-nums leading-none">
                      {week.correct}
                    </span>
                    {week.missed > 0 ? (
                      <span className="mt-1 h-1 w-1 rounded-full bg-[hsl(var(--warning))]" />
                    ) : (
                      <span className="mt-1 h-1 w-1" />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {playerProfile.missedPicks > 0 ? (
            <p className="text-xs text-muted-foreground">
              {playerProfile.missedPicks} missed pick
              {playerProfile.missedPicks === 1 ? "" : "s"} counted as losses
            </p>
          ) : null}
        </section>

        {league.superbowl_competition === true ? (
          <section className="flex flex-col gap-3 border-t pt-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Super Bowl</h2>
              {canEditSuperbowl && !editSuperBowlOpen ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditSuperBowlOpen(true)}
                >
                  Edit
                </Button>
              ) : null}
            </div>
            {editSuperBowlOpen ? (
              <EditSuperbowlForm
                memberId={memberId}
                leagueId={leagueId}
                playerProfile={playerProfile}
                onCancel={() => setEditSuperBowlOpen(false)}
              />
            ) : playerProfile.superbowlPickHidden ? (
              <p className="text-sm text-muted-foreground">
                Super Bowl picks are hidden until the season starts.
              </p>
            ) : superbowlWinner ? (
              <div className="flex flex-wrap items-center gap-3">
                {superbowlWinner.abbrev ? (
                  <TeamLogo
                    abbrev={superbowlWinner.abbrev}
                    width={28}
                    height={28}
                  />
                ) : null}
                <p className="text-sm">
                  {`${superbowlWinner.abbrev} over ${superbowlLoser?.abbrev} (score ${superbowl?.score})`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isViewer
                  ? "No Super Bowl pick yet."
                  : "No Super Bowl pick submitted."}
              </p>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { RouterOutputs } from "~/trpc/types";

type RenewalCandidate = RouterOutputs["league"]["renewalCandidates"][number];

export function NextSeasonRenewalSection({
  candidates,
}: {
  candidates: RenewalCandidate[];
}) {
  if (!candidates.length) return null;
  return (
    <section aria-labelledby="season-setup-heading" className="mt-8">
      <h2 id="season-setup-heading" className="mb-3 text-sm font-medium">
        Season setup
      </h2>
      <ul className="divide-y divide-border border-y border-border">
        {candidates.map((candidate) => (
          <li
            key={candidate.priorLeagueId}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4"
          >
            <div className="min-w-0 flex-1 basis-48">
              <p className="break-words font-medium">{candidate.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Renew your league and invite players back.
              </p>
            </div>
            <Link
              href={`/league/create?priorLeagueId=${candidate.priorLeagueId}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              Set Up Next Season{" "}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

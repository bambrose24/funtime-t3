import Link from "next/link";
import { ArrowRight, RefreshCw, Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { DEFAULT_SEASON } from "~/utils/const";
import type { RouterOutputs } from "~/trpc/types";

type RenewalCandidate = RouterOutputs["league"]["renewalCandidates"][number];

export function NextSeasonRenewalSection({
  candidates,
}: {
  candidates: RenewalCandidate[];
}) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <>
      <div className="col-span-12 flex justify-center pt-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <Text.H2>Next Season</Text.H2>
          </div>
          <Text.Muted>
            Renew a prior league and invite last year&apos;s players.
          </Text.Muted>
        </div>
      </div>
      <div className="col-span-12 flex w-full flex-row flex-wrap justify-center gap-4 py-4">
        {candidates.map((candidate) => (
          <Card
            key={candidate.priorLeagueId}
            className="w-full max-w-[320px] transition-colors hover:border-primary"
          >
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{candidate.season}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {candidate.memberCount}
                </div>
              </div>
              <Text.H4>{candidate.name}</Text.H4>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Admins</div>
                  <div className="font-medium">{candidate.adminCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">New Name</div>
                  <div className="font-medium">{candidate.suggestedName}</div>
                </div>
              </div>
              <Button asChild className="w-full gap-2">
                <Link
                  href={`/league/create?priorLeagueId=${candidate.priorLeagueId}`}
                >
                  Set Up Next Season
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

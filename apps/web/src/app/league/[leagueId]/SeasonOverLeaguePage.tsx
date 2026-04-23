import { CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { type RouterOutputs } from "~/trpc/types";

type SeasonOverLeaguePageProps = {
  league: RouterOutputs["league"]["get"];
};

export function SeasonOverLeaguePage({ league }: SeasonOverLeaguePageProps) {
  return (
    <>
      <div className="col-span-12 flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="col-span-12 flex justify-center px-4 py-8">
        <Card className="w-full max-w-xl border-primary/20 bg-primary/5 text-center">
          <CardHeader className="items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-background p-3 text-primary">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <CardTitle>The Season Is Over</CardTitle>
          </CardHeader>
          <CardContent>
            <Text.Muted>
              Thanks for playing this year. Kick back for now, and we&apos;ll
              see you next season.
            </Text.Muted>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

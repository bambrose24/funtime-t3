import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { serverApi } from "~/trpc/server";

// dynamic route params come in as `params` arg
type Props = {
  params: {
    leagueId: string;
    memberId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function MemberPage({
  params: { leagueId: leagueIdParam, memberId: memberIdParam },
}: Props) {
  const leagueId = Number(leagueIdParam);
  const memberId = Number(memberIdParam);

  if (!leagueId || !memberId) {
    return notFound();
  }

  const [response, teams] = await Promise.all([
    serverApi.playerProfile.get({ leagueId, memberId }),
    serverApi.teams.getTeams(),
  ]);

  const superbowl = response.member.superbowl.at(0);
  const superbowlWinner = teams.find((t) => t.teamid === superbowl?.winner);
  const superbowlLoser = teams.find((t) => t.teamid === superbowl?.loser);

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{response.member.people.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-row justify-between">
              <div>Correct Picks</div>
              <div>
                {response.correctPicks} /{" "}
                {response.wrongPicks + response.correctPicks} (
                {Math.floor(
                  (response.correctPicks /
                    (response.wrongPicks + response.correctPicks)) *
                    100,
                )}
                %)
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Messages Sent</div>
              <div>{response.member.leaguemessages.length}</div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Weeks Won</div>
              <div className="flex flex-row gap-1">
                {response.member.WeekWinners.length === 0 && (
                  <div className="text-sm">None</div>
                )}
                {response.member.WeekWinners.map((w, i) => {
                  return <div key={i}>Week {w.week}</div>;
                })}
              </div>
            </div>
            <Separator />
            <div className="flex w-full flex-row justify-between">
              <div>Super Bowl</div>
              <div>
                {superbowlWinner?.abbrev} over {superbowlLoser?.abbrev} (score{" "}
                {superbowl?.score})
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

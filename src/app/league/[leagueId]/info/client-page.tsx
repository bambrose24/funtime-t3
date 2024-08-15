"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  league: RouterOutputs["league"]["get"];
  members: RouterOutputs["league"]["members"];
};

export function ClientLeagueInfoPage({
  league: leagueInitialData,
  members: membersInitialData,
}: Props) {
  const { data: league } = clientApi.league.get.useQuery(
    {
      leagueId: leagueInitialData.league_id,
    },
    { initialData: leagueInitialData },
  );

  const { data: members } = clientApi.league.members.useQuery(
    { leagueId: leagueInitialData.league_id },
    { initialData: membersInitialData },
  );

  const admins = members.filter((m) => m.role === "admin");

  return (
    <div className="col-span-12 flex w-full flex-row justify-center py-4 md:col-span-6 md:col-start-4">
      <Card className="w-full">
        <CardContent>
          <CardHeader className="w-full text-center">
            <CardTitle>League Information</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="flex w-full items-center">
                <Text.Body className="font-bold">League Admin(s)</Text.Body>
              </div>
              <div className="flex w-full overflow-y-visible">
                {admins.map((admin) => {
                  return (
                    <div key={admin.membership_id}>
                      <Link
                        href={`/league/${league.league_id}/player/${admin.membership_id}`}
                      >
                        <span className="underline">
                          {admin.people.username}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

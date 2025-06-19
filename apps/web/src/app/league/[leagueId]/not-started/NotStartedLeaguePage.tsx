import { type RouterOutputs } from "~/trpc/types";
import { Text } from "~/components/ui/text";
import { notFound } from "next/navigation";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";

type Props = {
  league: RouterOutputs["league"]["get"];
  session: RouterOutputs["session"]["current"];
};

export async function NotStartedLeaguePage({ league, session }: Props) {
  const member = session.dbUser?.leaguemembers.find(
    (m) => m.league_id === league.league_id,
  );
  const user = session.dbUser;

  if (!member || !user) {
    notFound();
  }

  return (
    <>
      <div className="col-span-12 flex flex-row justify-center py-4">
        <Text.H1>{league.name}</Text.H1>
      </div>
      <div className="col-span-12 flex justify-center lg:col-span-6 lg:col-start-4">
        <Card className="w-full lg:max-w-[400px]">
          <CardHeader>
            <CardTitle className="text-center">
              The season has not started yet
            </CardTitle>
            <CardDescription className="text-center">
              You can start by making your picks for Week 1.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/league/${league.league_id}/pick`} className="w-full">
              <Button className="w-full">Make Week 1 Picks</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

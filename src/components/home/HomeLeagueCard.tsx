import { serverApi } from "~/trpc/server";
import { Card, CardContent, CardHeader } from "../ui/card";

type LeagueCardData = NonNullable<
  Awaited<ReturnType<(typeof serverApi)["home"]["summary"]>>
>[number];

export function HomeLeagueCard({ data }: { data: LeagueCardData }) {
  return (
    <Card>
      <CardHeader>{data.name}</CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

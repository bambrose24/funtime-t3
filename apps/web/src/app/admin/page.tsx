import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Users, Trophy, Activity, MessageSquare, Mail } from "lucide-react";
import { serverApi } from "~/trpc/server";
import { notFound } from "next/navigation";
import { DEFAULT_SEASON } from "~/utils/const";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";

export default async function AdminDashboard() {
  const data = await serverApi.generalAdmin.getAdminData().catch((e) => {
    console.error(`Viewer unable to access admin dashboard: ${e}`);
    notFound();
  });
  const { allLeagues, picksBySeason, messagesSent, emailsSent } = data;

  const thisSeasonLeagues = allLeagues
    .filter((league) => league.season === DEFAULT_SEASON)
    .sort((a, b) => {
      const memberDiff = b.members - a.members;
      if (memberDiff !== 0) {
        return memberDiff;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  const stats = [
    {
      title: "All-time Total Picks",
      value: picksBySeason.reduce((prev, curr) => prev + curr._count, 0),
      icon: Activity,
    },
    {
      title: "This Season Total Leagues",
      value: thisSeasonLeagues.length,
      icon: Trophy,
    },
    {
      title: "This Season Total Players",
      value: thisSeasonLeagues.reduce((prev, curr) => prev + curr.members, 0),
      icon: Users,
    },
    {
      title: "Messages Sent",
      value: messagesSent.reduce((prev, curr) => prev + curr._count, 0),
      icon: MessageSquare,
    },
    {
      title: "Emails Sent",
      value: emailsSent.reduce((prev, curr) => prev + curr._count, 0),
      icon: Mail,
    },
  ];
  return (
    <div className="col-span-12 w-full space-y-8 p-8">
      <div className="flex w-full flex-wrap gap-8">
        {stats.map((stat, index) => (
          <div key={index}>
            <Card className="w-[300px] min-w-[300px] max-w-[300px] flex-1 p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-6 w-6" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Picks by Season</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>Picks for Season</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {picksBySeason.map((seasonData) => (
                    <TableRow key={seasonData.season}>
                      <TableCell>{seasonData.season}</TableCell>
                      <TableCell>
                        {seasonData._count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="p-6">
        <CardHeader>
          <CardTitle>{DEFAULT_SEASON} Leagues</CardTitle>
          <CardDescription>
            {thisSeasonLeagues.length === 1
              ? "1 league, sorted by member count"
              : `${thisSeasonLeagues.length.toLocaleString()} leagues, sorted by member count`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>League</TableHead>
                  <TableHead className="w-24 text-right">Members</TableHead>
                  <TableHead className="w-1/3">Admin(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thisSeasonLeagues.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No leagues found for the {DEFAULT_SEASON} season.
                    </TableCell>
                  </TableRow>
                ) : (
                  thisSeasonLeagues.map((league) => (
                    <TableRow key={league.league_id}>
                      <TableCell>
                        <Link
                          href={`/league/${league.league_id}/admin`}
                          className="font-medium hover:underline"
                        >
                          {league.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {league.members.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {league.admins.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {league.admins.map((admin) => (
                              <Badge
                                key={admin.membershipId}
                                variant="secondary"
                                title={admin.email}
                              >
                                {admin.username}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

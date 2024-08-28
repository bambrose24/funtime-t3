import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Users, Trophy, Activity } from "lucide-react";
import { serverApi } from "~/trpc/server";
import { notFound } from "next/navigation";
import { DEFAULT_SEASON } from "~/utils/const";

export default async function AdminDashboard() {
  const data = await serverApi.generalAdmin.getAdminData().catch((e) => {
    console.error(`Viewer unable to access admin dashboard: ${e}`);
    notFound();
  });
  const { allLeagues, membersByLeague, picksBySeason } = data;

  const thisSeasonLeagues = allLeagues.filter(
    (l) => l.season === DEFAULT_SEASON,
  );
  const stats = [
    {
      title: "All-time Total Picks",
      value: picksBySeason.reduce((prev, curr) => prev + curr._count, 0),
      icon: Activity,
    },
    {
      title: "This Season Total Leagues",
      value: allLeagues.filter((l) => l.season === DEFAULT_SEASON).length,
      icon: Trophy,
    },
    {
      title: "This Season Total Players",
      value: thisSeasonLeagues.reduce((prev, curr) => prev + curr.members, 0),
      icon: Users,
    },
  ];
  return (
    <div className="col-span-12 w-full p-8">
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
                    <TableHead>Season x</TableHead>
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
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Activity, Users, Trophy } from "lucide-react";
import { serverApi } from "~/trpc/server";

export default async function AdminDashboard() {
  const data = await serverApi.generalAdmin.getAdminData();
  const { leaguesForSeason, membersForSeason, picksForSeason } = data;
  const stats = [
    { title: "Total Picks", value: picksForSeason, icon: Activity },
    { title: "Total Leagues", value: leaguesForSeason, icon: Trophy },
    { title: "Total Members", value: membersForSeason, icon: Users },
  ];
  return (
    <div className="col-span-12 w-full p-8">
      <div className="flex w-full flex-wrap gap-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="w-[300px] min-w-[300px] max-w-[300px] flex-1 p-6"
          >
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
        ))}
      </div>
    </div>
  );
}

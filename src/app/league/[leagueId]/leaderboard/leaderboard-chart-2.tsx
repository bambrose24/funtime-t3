/**
 * v0 by Vercel.
 * @see https://v0.dev/t/5QameZpRU4M
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, Line, YAxis } from "recharts";
import { useMemo } from "react";
import { type RouterOutputs } from "~/trpc/types";
import { useLeagueIdFromPath } from "~/utils/hooks/useLeagueIdFromPath";
import { clientApi } from "~/trpc/react";
import { cn } from "~/lib/utils";

type Props = {
  data: NonNullable<
    RouterOutputs["leaderboard"]["league"]
  >["chartableMembersData"];
  members: {
    memberId: number;
    username: string;
  }[];
  className?: string;
};

export function LeaderboardChart2({ data, members, className }: Props) {
  const chartConfig = useMemo(() => {
    return members.reduce((prev, curr, idx) => {
      prev[curr.memberId] = {
        color: `hsl(var(--chart-${(idx % 5) + 1}))`,
        label: curr.username,
      };
      return prev;
    }, {} as ChartConfig);
  }, [members]);

  const leagueId = useLeagueIdFromPath();
  const league = clientApi.league.get.useQuery(
    { leagueId: leagueId ?? 0 },
    { enabled: !!leagueId },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correct Picks by Week</CardTitle>
        <CardDescription>{league.data?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={cn("h-[500px] w-[700px]", className)}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  itemSorter={(item) => {
                    return item.value as number;
                  }}
                  labelFormatter={(label, payload) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    return (payload.at(0)?.payload.weekLabel ?? "") as string;
                  }}
                />
              }
            />
            {members.map((member, idx) => {
              return (
                <Line
                  key={member.memberId}
                  dataKey={member.memberId}
                  type="monotone"
                  stroke={`hsl(var(--chart-${(idx % 5) + 1}))`}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

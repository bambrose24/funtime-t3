import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { type RouterOutputs } from "~/trpc/types";

type LeaderboardData = NonNullable<RouterOutputs["leaderboard"]["league"]>;

type Props = {
  data: LeaderboardData["chartableMembersData"];
  selectedMembers: Array<{
    memberId: number;
    username: string;
  }>;
};

const SERIES_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export function MobileLeaderboardTrendChart({ data, selectedMembers }: Props) {
  const [chartWidth, setChartWidth] = useState(320);
  const chartHeight = 220;
  const padding = { top: 18, right: 14, bottom: 26, left: 28 };
  const plotWidth = Math.max(chartWidth - padding.left - padding.right, 1);
  const plotHeight = Math.max(chartHeight - padding.top - padding.bottom, 1);

  const maxY = useMemo(() => {
    if (selectedMembers.length === 0 || data.length === 0) {
      return 1;
    }
    const values = selectedMembers.flatMap((member) =>
      data.map((point) => Number((point as Record<string, unknown>)[String(member.memberId)] ?? 0)),
    );
    return Math.max(1, ...values);
  }, [data, selectedMembers]);

  if (data.length === 0) {
    return (
      <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
          Weekly chart data is not available yet.
        </Text>
      </View>
    );
  }

  if (selectedMembers.length === 0) {
    return (
      <View className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
          Select at least one member to see weekly progression.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
      onLayout={(event) => {
        const nextWidth = Math.floor(event.nativeEvent.layout.width) - 8;
        if (nextWidth > 0) {
          setChartWidth(nextWidth);
        }
      }}
    >
      <Svg width={chartWidth} height={chartHeight}>
        {[0, 1, 2, 3, 4].map((index) => {
          const ratio = index / 4;
          const y = padding.top + plotHeight * ratio;
          const tickValue = Math.round(maxY * (1 - ratio));
          return (
            <React.Fragment key={`grid_row_${index}`}>
              <Line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke="#d1d5db"
                strokeOpacity={0.55}
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 6}
                y={y + 3}
                fontSize={9}
                fill="#6b7280"
                textAnchor="end"
              >
                {tickValue}
              </SvgText>
            </React.Fragment>
          );
        })}

        {selectedMembers.map((member, memberIdx) => {
          const color = SERIES_COLORS[memberIdx % SERIES_COLORS.length] ?? "#3b82f6";
          const points = data.map((point, index) => {
            const x =
              padding.left +
              (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
            const value = Number(
              (point as Record<string, unknown>)[String(member.memberId)] ?? 0,
            );
            const y = padding.top + ((maxY - value) / maxY) * plotHeight;
            return { x, y, value };
          });

          const path = points
            .map((point, index) =>
              `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
            )
            .join(" ");

          return (
            <React.Fragment key={`member_series_${member.memberId}`}>
              <Path
                d={path}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {points.map((point, pointIdx) => (
                <Circle
                  key={`point_${member.memberId}_${pointIdx}`}
                  cx={point.x}
                  cy={point.y}
                  r={2.8}
                  fill={color}
                />
              ))}
            </React.Fragment>
          );
        })}

        {data.map((point, index) => {
          const weekValue = point.week;
          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          const shouldRenderLabel = data.length <= 8 || isFirst || isLast;
          if (!shouldRenderLabel) {
            return null;
          }
          const x =
            padding.left +
            (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
          return (
            <SvgText
              key={`week_label_${weekValue}_${index}`}
              x={x}
              y={chartHeight - 8}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
            >
              W{weekValue}
            </SvgText>
          );
        })}
      </Svg>

      <View className="mt-2 flex-row flex-wrap gap-2">
        {selectedMembers.map((member, memberIdx) => (
          <View
            key={`chart_legend_${member.memberId}`}
            className="flex-row items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[memberIdx % SERIES_COLORS.length] }}
            />
            <Text className="text-xs text-gray-700 dark:text-gray-300">
              @{member.username}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

import { type LineProps, ResponsiveLine } from "@nivo/line";
import { useTheme } from "next-themes";
import React from "react";
import { cn } from "~/lib/utils";

type ChartProps = {
  className?: string;
  entries: Array<{
    id: string;
    data: Array<{ x: string | number; y: number }>;
  }>;
};

const lineColors = [
  { dark: "#2563EB", light: "#93C5FD" }, // blue-500
  { dark: "#DC2626", light: "#F87171" }, // red-500
  { dark: "#34D399", light: "#6EE7B7" }, // green-500
  { dark: "#FBBF24", light: "#FDE68A" }, // yellow-500
  { dark: "#A855F7", light: "#C084FC" }, // purple-500
  { dark: "#EC4899", light: "#F9A8D4" }, // pink-500
  { dark: "#4F46E5", light: "#A5B4FC" }, // indigo-500
  { dark: "#22D3EE", light: "#6EE7B7" }, // teal-500
  { dark: "#EA580C", light: "#F97316" }, // orange-500
  { dark: "#4B5563", light: "#F3F4F6" }, // gray-500
  { dark: "#1E3A8A", light: "#93C5FD" }, // blue-700
  { dark: "#C53030", light: "#F87171" }, // red-700
  { dark: "#065F46", light: "#6EE7B7" }, // green-700
  { dark: "#B45309", light: "#FDE68A" }, // yellow-700
  { dark: "#6B21A8", light: "#C084FC" }, // purple-700
  { dark: "#BE185D", light: "#F9A8D4" }, // pink-700
  { dark: "#1D4ED8", light: "#A5B4FC" }, // indigo-700
  { dark: "#0E7490", light: "#6EE7B7" }, // teal-700
  { dark: "#D97706", light: "#F97316" }, // orange-700
  { dark: "#374151", light: "#F3F4F6" }, // gray-700
];

function useChartTheme(): LineProps["theme"] {
  const { resolvedTheme } = useTheme();

  const key = getLightDark(resolvedTheme ?? "");

  // Define colors for the Shadcn green theme
  const shadcnGray = key === "dark" ? "#4B5563" : "#D1D5DB";
  const shadcnDark = key === "dark" ? "#374151" : "#1F2937";
  const shadcnLight = key === "dark" ? "#D1D5DB" : "#F9FAFB";

  // Adjust the text color for axis ticks
  const textColor = key === "dark" ? "#718096" : "#6B7280";

  return {
    axis: {
      domain: {
        line: {
          stroke: shadcnGray,
        },
      },
      ticks: {
        line: {
          stroke: shadcnGray,
        },
        text: {
          fill: textColor,
        },
      },
    },
    grid: {
      line: {
        stroke: shadcnGray,
      },
    },
    tooltip: {
      container: {
        background: shadcnDark,
        color: shadcnLight,
      },
    },
  };
}

const themes = ["dark", "light"] as const;
type LightDark = (typeof themes)[number];

function getLightDark(maybeTheme: string): LightDark {
  return themes.includes(maybeTheme as LightDark)
    ? (maybeTheme as LightDark)
    : "light";
}

const LeaderboardChartImpl = ({ entries, className }: ChartProps) => {
  const { resolvedTheme } = useTheme();
  const chartTheme = useChartTheme();

  const key = getLightDark(resolvedTheme ?? "");

  const colors = lineColors.map((c) => (key === "dark" ? c.dark : c.light));
  return (
    <div className={cn("h-[500px] w-[700px]", className)}>
      <ResponsiveLine
        data={entries}
        // data={[
        //   {
        //     id: "asdf",
        //     data: [
        //       {
        //         x: "hi",
        //         y: 0,
        //       },
        //     ],
        //   },
        // ]}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
          min: 0,
          max: "auto",
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
          legend: "Week",
          legendOffset: 32,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={colors}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={chartTheme}
        animate={true}
        tooltip={({ point }) => {
          return (
            <div className="z-50 flex flex-col overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
              <p className="text-bold">{point.serieId}</p>
              <p className="text-semibold pt-2">
                Week {point.data.x.toString()}
              </p>
              <p className="text-muted">Correct: {point.data.y.toString()}</p>
            </div>
          );
        }}
        role="application"
      />
    </div>
  );
};

export const LeaderboardChart = React.memo(LeaderboardChartImpl);

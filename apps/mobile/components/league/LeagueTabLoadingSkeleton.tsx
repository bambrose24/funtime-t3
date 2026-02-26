import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

type LeagueTabLoadingSkeletonProps = {
  rows?: number;
};

export function LeagueTabLoadingSkeleton({
  rows = 3,
}: LeagueTabLoadingSkeletonProps) {
  return (
    <View className="flex-1 px-4 pt-4">
      <View className="mb-4 gap-2">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-4 w-56 rounded" />
      </View>

      <View className="gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <View
            key={`league_tab_skeleton_${index}`}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <View className="mb-3 gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </View>
            <View className="flex-row items-center justify-between">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

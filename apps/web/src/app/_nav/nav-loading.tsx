"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function NavLoading() {
  return (
    <div className="flex w-full flex-row justify-between">
      <Skeleton className="h-4 w-10 rounded-sm" />
      <Skeleton className="h-4 w-10 rounded-sm" />
    </div>
  );
}

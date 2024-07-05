"use client";

import { usePathname } from "next/navigation";
import { getNavOptions } from "./nav-options";

export function AdminTabTitle({ leagueId }: { leagueId: number }) {
  const pathname = usePathname();

  const baseHref = `/league/${leagueId}/admin`;

  const adminTabTitle =
    getNavOptions(baseHref).find(({ href }) => href === pathname)?.display ??
    "Menu";

  return <>{adminTabTitle}</>;
}

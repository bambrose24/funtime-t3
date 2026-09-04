"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getNavOptions } from "./nav-options";

export function MobileAdminNav({ leagueId }: { leagueId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const baseHref = `/league/${leagueId}/admin`;

  return (
    <Tabs
      value={pathname}
      onValueChange={(tabHrefValue) => {
        router.push(tabHrefValue);
      }}
      className="w-full"
    >
      <TabsList className="w-full md:w-auto">
        {getNavOptions(baseHref).map((opt) => {
          return (
            <TabsTrigger
              value={opt.href}
              key={opt.id}
              className="flex-grow md:flex-grow-0"
            >
              {opt.display}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getNavOptions } from "./nav-options";
import Link from "next/link";

export function MobileAdminNav({ leagueId }: { leagueId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const baseHref = `/league/${leagueId}/admin`;
  return (
    <Tabs
      defaultValue={
        getNavOptions(baseHref).find((opt) => pathname.includes(opt.href))
          ?.id ?? ""
      }
      onValueChange={(tabHrefValue) => {
        router.push(tabHrefValue);
      }}
      className="w-full"
    >
      <TabsList className="w-full justify-stretch">
        {getNavOptions(baseHref).map((opt, idx) => {
          return (
            <Link href={opt.href} key={idx} className="flex-grow">
              <TabsTrigger value={opt.href} className="w-full">
                {opt.display}
              </TabsTrigger>
            </Link>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

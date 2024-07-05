"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { getNavOptions } from "./nav-options";

export function AdminNav({ leagueId }: { leagueId: number }) {
  const baseHref = `/league/${leagueId}/admin`;

  const pathname = usePathname();

  return (
    <>
      {getNavOptions(baseHref).map(({ href, display }, idx) => {
        return (
          <Link
            key={idx}
            href={href}
            className={cn(
              buttonVariants({
                variant: href === pathname ? "secondary" : "ghost",
              }),
              "flex justify-start",
            )}
          >
            {display}
          </Link>
        );
      })}
    </>
  );
}

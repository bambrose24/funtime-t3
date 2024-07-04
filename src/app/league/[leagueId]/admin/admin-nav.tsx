"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function AdminNav({ leagueId }: { leagueId: number }) {
  const baseHref = `/league/${leagueId}/admin`;

  const pathname = usePathname();

  const links: Array<{ href: string; display: string }> = [
    {
      href: baseHref,
      display: "General",
    },
    {
      href: `${baseHref}/members`,
      display: "Members",
    },
  ];

  return (
    <>
      {links.map(({ href, display }, idx) => {
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

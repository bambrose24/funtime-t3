import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { z } from "zod";

const regex = /^\/league\/(\d+).*$/;

const zodInt = z.number().int();

export function useLeagueIdFromPath() {
  const pathname = usePathname();

  const match = pathname.match(regex);

  if (match) {
    const id = zodInt.safeParse(Number(match[1]));
    if (id.success) {
      return id.data;
    }
  }
  return undefined;
}

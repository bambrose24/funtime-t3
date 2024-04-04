import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { z } from "zod";

const path = "/league/8/more/nested/paths";
const regex = /^\/league\/(\d+)\/.*$/;

const zodInt = z.number().int();

export function useLeagueIdFromPath() {
  const pathname = usePathname();

  return useMemo(() => {
    const match = path.match(regex);

    if (match) {
      const id = zodInt.safeParse(Number(match[1]));
      if (id.success) {
        return id.data;
      }
    } else {
      console.log("No match found.");
    }
    return undefined;
  }, [pathname]);
}

import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "../db";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export async function getTeams() {
  const getTeamsImpl = unstable_cache(
    async () => {
      return await db.teams.findMany();
    },
    ["getTeams"],
    {
      revalidate: REVALIDATE_SECONDS,
    },
  );
  return await getTeamsImpl();
}

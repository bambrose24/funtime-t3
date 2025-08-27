import { cache } from "../../utils/cache";
import { db } from "../db";

const REVALIDATE_SECONDS = 60 * 60; // 1 hour

export async function getTeams() {
  const getTeamsImpl = cache(
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

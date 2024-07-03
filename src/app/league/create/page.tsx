import { z } from "zod";
import { CreateLeagueClientPage } from "./client-page";
import { serverApi } from "~/trpc/server";

const paramsSchema = z.object({
  priorLeagueId: z.preprocess(Number, z.number().int()).optional(),
});

export default async function CreateLeaguePage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const params = paramsSchema.safeParse(searchParams);
  const priorLeagueId = params.data?.priorLeagueId;

  const priorLeague = priorLeagueId
    ? await serverApi.league.get({ leagueId: priorLeagueId })
    : undefined;

  const createLeagueForm = await serverApi.league.createForm();

  return (
    <CreateLeagueClientPage
      priorLeague={priorLeague}
      createLeagueForm={createLeagueForm}
    />
  );
}

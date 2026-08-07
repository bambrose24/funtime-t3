import { z } from "zod";
import { CreateLeagueClientPage } from "./client-page";
import { serverApi } from "~/trpc/server";
import { redirect } from "next/navigation";

const paramsSchema = z.object({
  priorLeagueId: z.preprocess(Number, z.number().int()).optional(),
});

export default async function CreateLeaguePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const resolvedSearchParams = await searchParams;
  const [session, nav] = await Promise.all([
    serverApi.session.current(),
    serverApi.home.nav(),
  ]);
  if (!session.dbUser) {
    const params = new URLSearchParams({
      redirectTo: "/league/create",
    });
    redirect(`/login?${params.toString()}`);
  }

  const [canCreate, renewalStatus] = await Promise.all([
    serverApi.league.canCreate(),
    serverApi.league.renewalStatus(),
  ]);

  if (!canCreate) {
    redirect("/league");
  }
  const params = paramsSchema.safeParse(resolvedSearchParams);
  const priorLeagueId = params.data?.priorLeagueId;

  if (priorLeagueId && !renewalStatus.isOpen) {
    redirect(`/league/${priorLeagueId}`);
  }

  const priorLeague = priorLeagueId
    ? await serverApi.league.get({ leagueId: priorLeagueId })
    : undefined;
  if (priorLeagueId && priorLeague?.status !== "completed") {
    redirect(`/league/${priorLeagueId}`);
  }
  const renewalPreview = priorLeagueId
    ? await serverApi.league.renewalPreview({ priorLeagueId })
    : undefined;

  const createLeagueForm = await serverApi.league.createForm();

  return (
    <CreateLeagueClientPage
      priorLeague={priorLeague}
      renewalPreview={renewalPreview}
      createLeagueForm={createLeagueForm}
      navInitialData={nav}
    />
  );
}

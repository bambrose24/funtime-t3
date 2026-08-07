import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { serverApi } from "~/trpc/server";
import { RenewalInvitesClientPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const searchParamsSchema = z.object({
  priorLeagueId: z.preprocess(Number, z.number().int()),
});

export default async function RenewalInvitesPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const leagueId = Number(params.leagueId);
  const parsedSearchParams = searchParamsSchema.safeParse(searchParams);

  if (!Number.isInteger(leagueId) || !parsedSearchParams.success) {
    return notFound();
  }

  const priorLeagueId = parsedSearchParams.data.priorLeagueId;
  const renewalStatus = await serverApi.league.renewalStatus();
  if (!renewalStatus.isOpen) {
    redirect(`/league/${leagueId}`);
  }
  const preview = await serverApi.league.admin.renewalInvitePreview({
    leagueId,
    priorLeagueId,
  });

  return (
    <RenewalInvitesClientPage
      initialPreview={preview}
      leagueId={leagueId}
      priorLeagueId={priorLeagueId}
    />
  );
}

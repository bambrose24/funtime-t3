import { notFound, redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { RenewalInvitesClientPage } from "./client-page";

type Props = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function RenewalInvitesPage(props: Props) {
  const params = await props.params;
  const leagueId = Number(params.leagueId);

  if (!Number.isInteger(leagueId)) {
    return notFound();
  }

  const renewalStatus = await serverApi.league.renewalStatus();
  if (!renewalStatus.isOpen) {
    redirect(`/league/${leagueId}`);
  }
  const preview = await serverApi.league.admin.renewalInvitePreview({
    leagueId,
  });

  return (
    <RenewalInvitesClientPage initialPreview={preview} leagueId={leagueId} />
  );
}

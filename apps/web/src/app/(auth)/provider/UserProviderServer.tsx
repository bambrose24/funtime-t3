import { serverApi } from "~/trpc/server";
import { UserProviderClient } from "./UserProviderClient";

export async function UserProviderServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await serverApi.session.current();
  return <UserProviderClient data={session}>{children}</UserProviderClient>;
}

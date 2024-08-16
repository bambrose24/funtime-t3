import { ClientNav } from "./client-nav";
import { serverApi } from "~/trpc/server";

export async function Nav() {
  const [data, canCreateLeague] = await Promise.all([
    serverApi.home.nav(),
    serverApi.league.canCreate(),
  ]);

  return <ClientNav data={data} canCreateLeague={canCreateLeague} />;
}

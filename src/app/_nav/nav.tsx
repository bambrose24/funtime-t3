import { ClientNav } from "./client-nav";
import { serverApi } from "~/trpc/server";

export async function Nav() {
  const data = await serverApi.home.nav();

  return <ClientNav data={data} />;
}

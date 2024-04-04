import { Suspense } from "react";
import { ClientNav } from "./client-nav";
import { serverApi } from "~/trpc/server";
import { NavLoading } from "./nav-loading";

export async function Nav() {
  const data = await serverApi.home.nav();

  return (
    <Suspense fallback={<NavLoading />}>
      <ClientNav data={data} />
    </Suspense>
  );
}

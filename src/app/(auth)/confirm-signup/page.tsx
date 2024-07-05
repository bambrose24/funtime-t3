import { redirect } from "next/navigation";

import { ConfirmSignupClientPage } from "./client-page";
import { serverApi } from "~/trpc/server";

export default async function ConfirmSignupPage() {
  const session = await serverApi.session.current();
  if (session.dbUser) {
    redirect("/");
  }
  return <ConfirmSignupClientPage />;
}

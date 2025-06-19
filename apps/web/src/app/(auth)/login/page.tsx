import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { LoginClientPage } from "./client-page";

export default async function LoginPage() {
  const session = await serverApi.session.current();

  if (session.dbUser) {
    redirect("/");
  }

  return <LoginClientPage />;
}

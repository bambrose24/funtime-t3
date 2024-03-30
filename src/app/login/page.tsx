import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const session = await serverApi.session.current();

  if (session.dbUser) {
    redirect("/");
  }

  return <LoginClient />;
}

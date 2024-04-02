import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  const session = await serverApi.session.current();

  if (session.dbUser) {
    redirect("/");
  }

  return <ForgotPasswordClient />;
}

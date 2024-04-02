import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { ConfirmResetPasswordClient } from "./ConfirmResetPasswordClient";

export default async function ConfirmResetPasswordPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const session = await serverApi.session.current();
  const code = searchParams?.code;

  if (Boolean(session.dbUser) || typeof code !== "string") {
    redirect("/");
  }

  return <ConfirmResetPasswordClient />;
}

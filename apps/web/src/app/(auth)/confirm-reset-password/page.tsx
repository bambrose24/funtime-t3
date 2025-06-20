import { redirect } from "next/navigation";
import { ConfirmResetPasswordClient } from "./client-page";

export default async function ConfirmResetPasswordPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const code = searchParams?.code;

  if (typeof code !== "string") {
    redirect("/login");
  }

  return <ConfirmResetPasswordClient />;
}

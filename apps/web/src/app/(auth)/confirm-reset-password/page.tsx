import { redirect } from "next/navigation";
import { ConfirmResetPasswordClient } from "./client-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ConfirmResetPasswordPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code;

  if (typeof code !== "string") {
    redirect("/login");
  }

  return <ConfirmResetPasswordClient />;
}

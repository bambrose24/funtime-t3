import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";
import { SignupClientPage } from "./client-page";

export default async function SignupPage() {
  const session = await serverApi.session.current();
  if (session.dbUser) {
    redirect("/");
  }
  return <SignupClientPage />;
}

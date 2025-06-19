import { redirect } from "next/navigation";
import { serverApi } from "~/trpc/server";

export default async function SettingsPage() {
  const session = await serverApi.session.current();
  if (session.dbUser) {
    redirect("/settings/profile");
  } else {
    redirect("/login");
  }
}

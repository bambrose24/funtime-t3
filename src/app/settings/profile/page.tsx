import { redirect } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { serverApi } from "~/trpc/server";
import { UserInfoSettings } from "./UserInfoSettings";

export default async function ProfileSettingsPage() {
  const settingsData = await serverApi.settings.get();
  const dbUser = settingsData?.dbUser;
  if (!dbUser) {
    redirect("/login");
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-row gap-3">
          <UserInfoSettings data={settingsData} />
        </div>
      </CardContent>
    </Card>
  );
}

import { redirect } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { serverApi } from "~/trpc/server";
import { UserInfoSettings } from "./UserInfoSettings";

export default async function ProfileSettingsPage() {
  const settings = await serverApi.settings.get();
  if (!settings) {
    redirect("/login");
  }

  return (
    <Card className="bg-background">
      <CardContent className="py-4">
        <div className="flex flex-row gap-3">
          <UserInfoSettings data={settings} />
        </div>
      </CardContent>
    </Card>
  );
}

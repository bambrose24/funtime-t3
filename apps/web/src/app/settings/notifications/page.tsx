import { redirect } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { serverApi } from "~/trpc/server";
import { NotificationSettings } from "./NotificationSettings";

export default async function NotificationsSettingsPage() {
  const session = await serverApi.session.current();
  if (!session.dbUser) {
    redirect("/login?redirectTo=/settings/notifications");
  }

  const settings = await serverApi.settings.get();

  return (
    <Card className="bg-background">
      <CardContent className="py-4">
        <NotificationSettings data={settings} />
      </CardContent>
    </Card>
  );
}

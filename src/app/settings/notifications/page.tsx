import { redirect } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { serverApi } from "~/trpc/server";

export default async function NotificationsSettingsPage() {
  const session = await serverApi.session.settings();
  const dbUser = session?.dbUser;
  if (!dbUser) {
    redirect("/login");
  }

  return (
    <Card>
      <CardContent className="py-4">
        <Text.H2>Notifications</Text.H2>
        More coming soon.
      </CardContent>
    </Card>
  );
}

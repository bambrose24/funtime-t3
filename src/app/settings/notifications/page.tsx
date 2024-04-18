import { redirect } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { serverApi } from "~/trpc/server";

async function wait(ms: number) {
  return new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}

export default async function NotificationsSettingsPage() {
  const settings = await serverApi.settings.get();
  if (!settings) {
    redirect("/login");
  }

  await wait(3000);

  return (
    <Card className="bg-background">
      <CardContent className="py-4">
        <Text.H2>Notifications</Text.H2>
        More coming soon.
      </CardContent>
    </Card>
  );
}

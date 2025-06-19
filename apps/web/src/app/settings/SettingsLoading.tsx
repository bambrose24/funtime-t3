import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function SettingsLoading() {
  return (
    <Card className="bg-background">
      <CardHeader>
        <Skeleton className="h-[50px] w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

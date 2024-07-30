"use client";

import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { type RouterOutputs } from "~/trpc/types";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Input } from "~/components/ui/input";
import { CopyIcon } from "lucide-react";
import { Text } from "~/components/ui/text";
import { Separator } from "~/components/ui/separator";
import { LeagueAdminChangeNameSetting } from "./LeagueAdminChangeNameSetting";

type Props = {
  league: RouterOutputs["league"]["get"];
};

export function LeagueAdminClientPage({ league }: Props) {
  const shareLink = `${window.location?.origin}/join-league/${league.share_code}`;
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center">
        <div className="flex w-full flex-col items-center gap-4 md:w-[600px]">
          <CardTitle className="py-2 text-2xl">
            General Admin Settings
          </CardTitle>
          <LeagueAdminChangeNameSetting league={league} />
          <Separator />
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Text.H4>League Share Link</Text.H4>
              <span className="text-muted-foreground">
                Send this link to people you want to join this league. They have
                until the season starts to register.
              </span>
            </div>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                value={shareLink}
                disabled
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareLink);
                  toast.success(`Copied join link to clipboard`);
                }}
                className="inline-flex items-center space-x-2"
              >
                <CopyIcon className="h-4 w-4" />
                <span className="hidden lg:block">Copy League Link</span>
                <span className="lg:hidden">Copy</span>
              </Button>
            </div>
          </div>
          {/* <Separator /> */}
        </div>
      </CardContent>
    </Card>
  );
}

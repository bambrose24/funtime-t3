"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type RouterOutputs } from "~/trpc/types";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

type Props = {
  league: RouterOutputs["league"]["get"];
};

export function LeagueAdminClientPage({ league }: Props) {
  const shareLink = `${window.location?.origin}/join-league/${league.share_code}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
      </CardHeader>
      <CardContent className="w-full">
        <div className="flex flex-row">
          <div className="flex items-center rounded-md rounded-r-none border-2 border-r-0 border-input p-2 text-sm">
            {shareLink}
          </div>
          <div className="border-y-[2px] border-input px-1">
            <div className="h-full w-[2px] bg-input" />
          </div>
          <div className="rounded-md rounded-l-none border-2 border-l-0 border-input p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(shareLink);
                toast.success(`Copied share link to clipboard`);
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

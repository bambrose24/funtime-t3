"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getBaseUrl } from "~/utils/getBaseUrl";

export function ShareLeagueLinkClient({ shareCode }: { shareCode: string }) {
  const shareLink = `${getBaseUrl()}/join-league/${shareCode}`;

  return (
    <div className="col-span-12 flex justify-center">
      <div className="w-full max-w-4xl">
        <Alert className="flex w-full items-center border-primary bg-primary/5">
          <AlertDescription>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  Invite friends to join your league!
                </span>
                <span className="text-sm text-muted-foreground">
                  Share this link with people you want to invite. They have
                  until the season starts to register.
                </span>
              </div>
              <div className="flex w-full items-center space-x-2 sm:w-auto">
                <Input
                  type="text"
                  value={shareLink}
                  disabled
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareLink);
                      toast.success("Join link copied to clipboard");
                    } catch (error) {
                      toast.error("Failed to copy link");
                    }
                  }}
                  className="inline-flex shrink-0 items-center space-x-2"
                >
                  <CopyIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy Link</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

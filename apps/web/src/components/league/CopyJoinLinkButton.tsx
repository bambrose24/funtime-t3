"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "~/components/ui/button";
import { getBaseUrl } from "~/utils/getBaseUrl";

type Props = {
  shareCode: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

export function CopyJoinLinkButton({
  shareCode,
  size = "sm",
  variant = "outline",
}: Props) {
  const joinLink = `${getBaseUrl()}/join-league/${shareCode}`;

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(joinLink);
          toast.success("Join link copied");
        } catch {
          toast.error("Unable to copy join link");
        }
      }}
      className="gap-2"
    >
      <Copy className="h-4 w-4" />
      Copy Link
    </Button>
  );
}

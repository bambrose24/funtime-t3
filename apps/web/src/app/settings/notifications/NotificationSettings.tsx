"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  data: RouterOutputs["settings"]["get"];
};

export function NotificationSettings({ data }: Props) {
  const { data: settings } = clientApi.settings.get.useQuery(undefined, {
    initialData: data,
  });
  const utils = clientApi.useUtils();
  const [isSaving, setIsSaving] = useState(false);
  const enabled = settings.dbUser.week_summary_emails_enabled;

  const { mutateAsync: setWeekSummaryEmailsEnabled } =
    clientApi.settings.setWeekSummaryEmailsEnabled.useMutation({
      onSuccess: async (result) => {
        utils.settings.get.setData(undefined, (current) =>
          current
            ? {
                dbUser: {
                  ...current.dbUser,
                  week_summary_emails_enabled: result.enabled,
                },
              }
            : current,
        );
        await utils.settings.get.invalidate();
        toast.success(
          result.enabled
            ? "Weekly recap emails are on."
            : "Weekly recap emails are off.",
        );
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const onToggle = async (nextEnabled: boolean) => {
    if (isSaving || nextEnabled === enabled) {
      return;
    }
    setIsSaving(true);
    try {
      await setWeekSummaryEmailsEnabled({ enabled: nextEnabled });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text.H2>Notifications</Text.H2>
        <Text.Muted>
          Choose which Funtime emails you want. These apply to every league on
          your account.
        </Text.Muted>
      </div>
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-1 pr-3">
          <Label htmlFor="week-summary-emails" className="text-base">
            Weekly recap emails
          </Label>
          <Text.Muted>
            After each week is final, get your results, standing, and a link to
            make next week&apos;s picks.
          </Text.Muted>
        </div>
        <Switch
          id="week-summary-emails"
          aria-label="Weekly recap emails"
          checked={enabled}
          disabled={isSaving}
          onCheckedChange={(checked) => {
            void onToggle(checked);
          }}
        />
      </div>
    </div>
  );
}

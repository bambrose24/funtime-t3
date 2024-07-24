"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { clientApi } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/types";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

const schema = z.object({
  leagueName: z.string().min(5).max(50),
});

type Props = {
  league: RouterOutputs["league"]["get"];
};

export function LeagueAdminChangeNameSetting({ league }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      leagueName: league.name,
    },
  });

  const router = useRouter();

  const { mutateAsync: changeName } =
    clientApi.league.admin.changeName.useMutation();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    const { leagueName } = data;

    await changeName({ leagueId: league.league_id, leagueName });

    toast.success(`Successfully changed the league name`);

    window.location.reload();
  };
  return (
    <div className="flex w-full flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="leagueName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">League Name</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input {...field} required />
                    <Button
                      type="submit"
                      disabled={
                        form.formState.isSubmitting || !form.formState.isDirty
                      }
                    >
                      Save
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Update the league name. This will take effect immediately for
                  all members in the league.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

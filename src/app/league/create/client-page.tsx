"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { createLeagueFormSchema } from "./schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { type RouterOutputs } from "~/trpc/types";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Props = {
  priorLeague: RouterOutputs["league"]["get"] | undefined;
  createLeagueForm: RouterOutputs["league"]["createForm"];
};

export function CreateLeagueClientPage({
  priorLeague,
  createLeagueForm,
}: Props) {
  const form = useForm<z.infer<typeof createLeagueFormSchema>>({
    resolver: zodResolver(createLeagueFormSchema),
    defaultValues: {
      priorLeagueId: priorLeague?.league_id,
      latePolicy: priorLeague?.late_policy ?? "allow_late_and_lock_after_start",
      pickPolicy: priorLeague?.pick_policy ?? "choose_winner",
      reminderPolicy: priorLeague?.reminder_policy ?? "three_hours_before",
      scoringType: "game_winner",
    },
  });

  return (
    <div className="col-span-12 flex flex-col gap-3 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
      <Card>
        <CardHeader className="flex w-full justify-center">
          <div className="flex flex-col ">
            <Text.H3 className="text-center">Create a League</Text.H3>
            <Text.Small className="mt-4">
              Creating a league means you&apos;ll manage a pick &apos;em league
              weekly. The game runs itself; all you have to do is invite people
              to the league, and all of these rules are enforced for you.
              <br />
              <br />
              As the admin, you&apos;ll have access to tools to manage the
              league, including sending out messages to the league and picking
              on people&apos;s behalf when needed.
            </Text.Small>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="priorLeagueId"
                render={({ field }) => {
                  if (!field.value || !priorLeague) {
                    return <></>;
                  }

                  return (
                    <Alert>
                      <AlertTitle className="flex w-full  flex-row items-center justify-between">
                        <div className="flex flex-row gap-2">
                          <AlertCircleIcon className="h-4 w-4" />
                          <div>
                            You are creating a league based on{" "}
                            <span>
                              <Link
                                className="underline"
                                href={`/league/${priorLeague.league_id}`}
                              >
                                {priorLeague.name}
                              </Link>
                            </span>
                            .
                          </div>
                        </div>
                      </AlertTitle>
                    </Alert>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>League Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="latePolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Policy</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(createLeagueForm.latePolicy).map(
                            (policy, idx) => {
                              const display =
                                policy === "allow_late_and_lock_after_start"
                                  ? "Allow Late & Lock Submissions"
                                  : policy === "allow_late_whole_week"
                                    ? "Allow Late Entire Week"
                                    : policy === "close_at_first_game_start"
                                      ? "Close at First Game Start"
                                      : null;
                              return (
                                <SelectItem
                                  key={`${policy}_${idx}`}
                                  value={policy}
                                >
                                  {display}
                                </SelectItem>
                              );
                            },
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

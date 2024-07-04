"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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
import { ReminderPolicy } from "~/generated/prisma-client";
import { Button } from "~/components/ui/button";

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
      name: "",
      priorLeagueId: priorLeague?.league_id,
      latePolicy: priorLeague?.late_policy ?? "allow_late_and_lock_after_start",
      pickPolicy: priorLeague?.pick_policy ?? "choose_winner",
      reminderPolicy: priorLeague?.reminder_policy ?? "three_hours_before",
      scoringType: "game_winner",
      superbowlCompetition: priorLeague?.superbowl_competition ?? true,
    },
  });

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    console.log("submitted data", data);
  };

  return (
    <div className="col-span-12 flex flex-col gap-3 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <Card>
            <CardHeader className="flex w-full justify-center">
              <div className="flex flex-col ">
                <Text.H3 className="text-center">Create a League</Text.H3>
                <Text.Small className="mt-4">
                  Creating a league means you&apos;ll manage a pick &apos;em
                  league weekly. The game runs itself; all you have to do is
                  invite people to the league, and all of these rules are
                  enforced for you.
                  <br />
                  <br />
                  As the admin, you&apos;ll have access to tools to manage the
                  league, including sending out messages to the league and
                  picking on people&apos;s behalf when needed.
                </Text.Small>
              </div>
            </CardHeader>
            <CardContent>
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
                      <FormDescription>
                        Whether or not to allow late picks. This is a helpful
                        setting to allow people to forget the Thursday game, but
                        still make picks for games that haven&apos;t started. If
                        you enable it, people who are late cannot see the
                        league&apos;s picks until they submit theirs.
                      </FormDescription>
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
                                    ? "Allow Late"
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
                <FormField
                  control={form.control}
                  name="reminderPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pick Reminders</FormLabel>
                      <FormDescription>
                        Whether or not you want to remind players when they have
                        not made picks yet. Reminders go out approximately 3
                        hours before the start of the first game each week, and
                        only goes to players who have not picked.
                      </FormDescription>
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value={ReminderPolicy.three_hours_before}
                            >
                              Yes
                            </SelectItem>
                            <SelectItem value="none">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="superbowlCompetition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Bowl Competition</FormLabel>
                      <FormDescription>
                        The Super Bowl compeitition is a way to keep playing
                        after the regular season is over. It works by asking
                        each player to pick a Super Bowl winner and loser, as
                        well as a total game score. The player who gets the
                        winner, or the loser, or the closest score (in that
                        priority order) will win the Super Bowl compeition.
                      </FormDescription>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value ? "yes" : "no"}
                          onValueChange={(val) => {
                            form.setValue(
                              "superbowlCompetition",
                              val === "yes",
                            );
                          }}
                        >
                          <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                Create League
              </Button>
            </CardFooter>
          </Card>
        </Form>
      </form>
    </div>
  );
}

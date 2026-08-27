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
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { clientApi } from "~/trpc/react";
import { DEFAULT_SEASON } from "~/utils/const";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Info, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { RenewalInviteDialog } from "./RenewalInviteDialog";

type Props = {
  priorLeague: RouterOutputs["league"]["get"] | undefined;
  renewalPreview: RouterOutputs["league"]["renewalPreview"] | undefined;
  renewalInvitees: RouterOutputs["league"]["renewalInvitees"] | undefined;
  createLeagueForm: RouterOutputs["league"]["createForm"];
  navInitialData: RouterOutputs["home"]["nav"];
};

export function CreateLeagueClientPage({
  priorLeague,
  renewalPreview,
  renewalInvitees,
  createLeagueForm,
  navInitialData,
}: Props) {
  const { data: nav } = clientApi.home.nav.useQuery(undefined, {
    initialData: navInitialData,
  });

  const router = useRouter();
  const form = useForm<z.infer<typeof createLeagueFormSchema>>({
    resolver: zodResolver(createLeagueFormSchema),
    mode: "onChange",
    defaultValues: {
      name: renewalPreview?.suggestedName ?? "",
      priorLeagueId: priorLeague?.league_id?.toString() ?? "none",
      latePolicy: priorLeague?.late_policy ?? "allow_late_and_lock_after_start",
      pickPolicy: priorLeague?.pick_policy ?? "choose_winner",
      reminderPolicy: priorLeague?.reminder_policy ?? "three_hours_before",
      scoringType: "game_winner",
      superbowlCompetition: priorLeague?.superbowl_competition ?? true,
    },
  });
  const isRenewalMode = Boolean(priorLeague && renewalPreview);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [pendingRenewalData, setPendingRenewalData] = useState<
    z.infer<typeof createLeagueFormSchema> | undefined
  >();
  const [isRenewalCreating, setIsRenewalCreating] = useState(false);

  const trpcUtils = clientApi.useUtils();
  const { mutateAsync: createLeague } = clientApi.league.create.useMutation({
    onSettled: async () => {
      await trpcUtils.league.invalidate();
    },
  });
  const { mutateAsync: sendRenewalInvites } =
    clientApi.league.admin.sendRenewalInvites.useMutation();

  const createLeagueFromData = async (
    data: z.infer<typeof createLeagueFormSchema>,
    selectedMemberIds?: number[],
    adminMemberIds?: number[],
  ) => {
    try {
      const newLeague = await createLeague({
        latePolicy: data.latePolicy,
        name: data.name,
        ...(data.pickPolicy && { pickPolicy: data.pickPolicy }),
        ...(data.reminderPolicy &&
          data.reminderPolicy !== "none" && {
            reminderPolicy: data.reminderPolicy,
          }),
        superbowlCompetition: data.superbowlCompetition,
        priorLeagueId:
          data.priorLeagueId !== "none"
            ? Number(data.priorLeagueId)
            : undefined,
      });

      toast.success(`The league ${newLeague.name} was created.`);
      if (data.priorLeagueId && data.priorLeagueId !== "none") {
        if (selectedMemberIds) {
          try {
            const inviteResult = await sendRenewalInvites({
              leagueId: newLeague.league_id,
              memberIds: selectedMemberIds,
              adminMemberIds,
            });
            if (inviteResult.initiatorCopyFailed) {
              toast.error(
                `Sent ${inviteResult.sentCount} ${inviteResult.sentCount === 1 ? "invite" : "invites"}, but your confirmation copy could not be delivered.`,
              );
            } else {
              toast.success(
                `Sent ${inviteResult.sentCount} ${inviteResult.sentCount === 1 ? "invite" : "invites"}.${inviteResult.initiatorCopySent ? " A confirmation copy was sent to you." : ""}`,
              );
            }
          } catch (error) {
            toast.error(
              "The league was created, but invitations were not sent. You can send them from the next page.",
            );
          }
        }
        router.push(`/league/${newLeague.league_id}/renewal-invites`);
        return;
      }
      router.push(`/league/${newLeague.league_id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create league",
      );
    }
  };
  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    if (isRenewalMode && renewalInvitees) {
      setPendingRenewalData(data);
      setInviteDialogOpen(true);
      return;
    }

    await createLeagueFromData(data);
  };

  return (
    <TooltipProvider>
      <div className="col-span-12 flex flex-col gap-3 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <Card>
              <CardHeader className="flex w-full justify-center">
                <div className="flex flex-col ">
                  <Text.H3 className="text-center">
                    {isRenewalMode
                      ? `Set Up the ${DEFAULT_SEASON} Season`
                      : "Create a League"}
                  </Text.H3>
                  <Text.Small className="mt-4">
                    {isRenewalMode
                      ? "Renew your prior league, keep the rules that worked, and choose who to invite before you create it."
                      : "Creating a league means you'll manage a pick 'em league weekly. The game runs itself; invite people and the rules are enforced for you."}
                  </Text.Small>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {isRenewalMode && renewalPreview && priorLeague ? (
                    <Alert className="border-primary/30 bg-primary/5">
                      <AlertTitle className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Renewing{" "}
                          <Link
                            className="underline"
                            href={`/league/${priorLeague.league_id}`}
                          >
                            {priorLeague.name}
                          </Link>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-normal">
                          <Badge variant="secondary">
                            {priorLeague.season}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Users className="h-3 w-3" />
                            {renewalPreview.memberCount} players
                          </Badge>
                          <Badge variant="outline">
                            {renewalPreview.adminCount} admins
                          </Badge>
                        </div>
                      </AlertTitle>
                    </Alert>
                  ) : null}
                  {isRenewalMode && renewalPreview ? (
                    <div className="rounded-md border bg-muted/30 p-3">
                      <Text.Small className="font-medium">
                        Copied settings
                      </Text.Small>
                      <Separator className="my-2" />
                      <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span>Late picks</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="About late-pick rules"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                These rules apply to every weekly pick. You can
                                change the policy below before creating the
                                league.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {form.watch("latePolicy") ===
                          "allow_late_and_lock_after_start" ? (
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                              <li>
                                Players can pick games that have not started.
                              </li>
                              <li>
                                They cannot view other picks until they submit.
                              </li>
                            </ul>
                          ) : (
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
                              <li>
                                All weekly picks close at the first kickoff.
                              </li>
                              <li>Players cannot submit after that time.</li>
                            </ul>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Reminders
                          </span>
                          <div className="font-medium">
                            {form.watch("reminderPolicy") === "none"
                              ? "Disabled"
                              : "3 hours before"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scoring</span>
                          <div className="font-medium">Game winner</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span>Super Bowl Contest</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="About the Super Bowl Contest"
                                >
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Players predict the winner, loser, and total
                                score. The most accurate prediction wins the
                                contest.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="mt-1 font-medium">
                            {form.watch("superbowlCompetition")
                              ? "Included — winner, loser, and total score"
                              : "Not included"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
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
                    name="priorLeagueId"
                    render={({ field }) =>
                      isRenewalMode && priorLeague ? (
                        <FormItem>
                          <FormLabel>Prior League</FormLabel>
                          <FormControl>
                            <Input
                              value={`${priorLeague.name} (${priorLeague.season})`}
                              disabled
                            />
                          </FormControl>
                          <FormDescription>
                            This renewal will stay linked to the prior league.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      ) : (
                        <FormItem>
                          <FormLabel>Prior League?</FormLabel>
                          <FormControl>
                            <Select {...field} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={"none"}>None</SelectItem>
                                {nav?.leagues
                                  .filter(
                                    (league) =>
                                      league.season < DEFAULT_SEASON &&
                                      league.status === "completed",
                                  )
                                  .map((league, idx) => {
                                    return (
                                      <SelectItem
                                        key={idx}
                                        value={league.league_id.toString()}
                                      >
                                        {league.name}
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            If you&apos;re making a league from a prior league,
                            mark it here. You&apos;ll be able to invite folks
                            from the prior league easily.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }
                  />
                  <FormField
                    control={form.control}
                    name="latePolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Late Policy</FormLabel>
                        <FormDescription>
                          Whether or not to allow late picks. This is a helpful
                          setting to allow people to forget the Thursday game,
                          but still make picks for games that haven&apos;t
                          started. If you enable it, people who are late cannot
                          see the league&apos;s picks until they submit theirs.
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
                          Whether or not you want to remind players when they
                          have not made picks yet. Reminders go out
                          approximately 3 hours before the start of the first
                          game each week, and only goes to players who have not
                          picked.
                        </FormDescription>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full ring-2 ring-input focus:ring-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="three_hours_before">
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
                        <FormLabel>Super Bowl Contest</FormLabel>
                        <FormDescription>
                          Players predict the winner, loser, and total score.
                          The most accurate prediction wins after the regular
                          season ends.
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
                  loading={form.formState.isSubmitting}
                >
                  {isRenewalMode ? "Review Invites" : "Create League"}
                </Button>
              </CardFooter>
            </Card>
          </Form>
        </form>
        {renewalInvitees ? (
          <RenewalInviteDialog
            invitees={renewalInvitees}
            open={inviteDialogOpen}
            onOpenChange={setInviteDialogOpen}
            onConfirm={async (memberIds, adminMemberIds) => {
              if (!pendingRenewalData) {
                return;
              }
              setIsRenewalCreating(true);
              await createLeagueFromData(
                pendingRenewalData,
                memberIds,
                adminMemberIds,
              );
              setIsRenewalCreating(false);
            }}
            isCreating={isRenewalCreating}
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
}

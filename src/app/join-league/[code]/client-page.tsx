"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogout } from "~/app/(auth)/auth/useLogout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  data: NonNullable<RouterOutputs["league"]["fromJoinCode"]>;
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
};

const schema = z.object({
  superbowlAfcTeamId: z.string(),
  superbowlNfcTeamId: z.string(),
  superbowlWinnerTeam: z.number().int(),
  superbowlTotalScore: z.number().int(),
});

export function JoinLeagueClientPage({ data, session, teams }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const logout = useLogout();

  const onSubmit: Parameters<typeof form.handleSubmit>[0] = async (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        className="col-span-12 flex justify-center"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card className="max-w-[600px]">
          <CardHeader>
            <CardTitle>Join {data.name}</CardTitle>
            <CardDescription>
              Register below to join. You are logged in as{" "}
              <span className="font-bold">{session.dbUser?.username}</span>. Not
              you?{" "}
              <span onClick={logout} className="cursor-pointer underline">
                Log out
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">League Rules</div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="superbowlAfcTeamId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>AFC Team</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {teams
                                .filter((t) => t.conference === "AFC")
                                .map((team, idx) => {
                                  return (
                                    <SelectItem
                                      key={idx}
                                      value={team.teamid.toString()}
                                    >
                                      {team.loc} {team.name}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="superbowlNfcTeamId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>NFC Team</FormLabel>
                        <FormControl>
                          <Select>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {teams
                                .filter((t) => t.conference === "NFC")
                                .map((team, idx) => {
                                  return (
                                    <SelectItem
                                      key={idx}
                                      value={team.teamid.toString()}
                                    >
                                      {team.loc} {team.name}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              Register
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

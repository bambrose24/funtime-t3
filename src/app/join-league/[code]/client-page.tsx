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
import { Form } from "~/components/ui/form";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  data: NonNullable<RouterOutputs["league"]["fromJoinCode"]>;
  session: RouterOutputs["session"]["current"];
  teams: RouterOutputs["teams"]["getTeams"];
};

const schema = z.object({});

export function JoinLeagueClientPage({ data, session, teams }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const logout = useLogout();
  return (
    <Form {...form}>
      <div className="col-span-12 flex justify-center">
        <Card className="max-w-[400px]">
          <CardHeader>
            <CardTitle>Join {data.name}</CardTitle>
            <CardDescription>
              Register below to join. You are logged in as{" "}
              {session.dbUser?.username}. Not you?{" "}
              <Button asChild onClick={logout}>
                <span className="cursor-pointer underline">Log out</span>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>hi</CardContent>
          <CardFooter>
            <Button className="w-full">Register</Button>
          </CardFooter>
        </Card>
      </div>
    </Form>
  );
}

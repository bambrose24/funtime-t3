"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { z } from "zod";

export function JoinOrCreateALeague() {
  return (
    <div className="grid max-w-[900px] grid-cols-1 justify-between gap-4 lg:grid-cols-2">
      <div className="col-span-1">
        <JoinLeagueCard />
      </div>
      <div className="col-span-1">
        <CreateLeagueCard />
      </div>
    </div>
  );
}

function CreateLeagueCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a League</CardTitle>
      </CardHeader>
      <CardContent>
        If you want to play, but don&apos;t have a league, you can create one
        here.
      </CardContent>
      <CardFooter>
        <Button>Create a League</Button>
      </CardFooter>
    </Card>
  );
}

const joinLeagueSchema = z.object({ leagueCode: z.string().min(1) });
type JoinLeagueData = z.infer<typeof joinLeagueSchema>;

function JoinLeagueCard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinLeagueData>({
    resolver: zodResolver(joinLeagueSchema),
  });

  const onSubmit = (data: JoinLeagueData) => {
    console.log(data); // You can handle form submission here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a League</CardTitle>
      </CardHeader>
      <CardContent>
        If you know about a league, you can enter the code here.
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input id="leagueCode" {...register("leagueCode")} />
          {errors.leagueCode && <span>This field is required.</span>}
          <Button
            type="submit"
            className="w-full"
            disabled={Object.keys(errors).length > 0}
          >
            Join League
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

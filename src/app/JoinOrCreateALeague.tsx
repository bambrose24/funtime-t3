"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import Link from "next/link";
import { cn } from "~/lib/utils";

export function JoinOrCreateALeague() {
  return (
    <>
      <div className="col-span-12">
        <JoinLeagueCard />
      </div>
      <div className="col-span-12">
        <CreateLeagueCard />
      </div>
    </>
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
        <Link
          className={cn(buttonVariants({ variant: "default" }), "w-full")}
          href="/league/create"
        >
          Create a League
        </Link>
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
    // TODO handle URL's and codes
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
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col gap-2">
            <Input id="leagueCode" {...register("leagueCode")} />
            {errors.leagueCode && <span>This field is required.</span>}
            <Button
              type="submit"
              className="w-full"
              disabled={Object.keys(errors).length > 0}
            >
              Join League
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

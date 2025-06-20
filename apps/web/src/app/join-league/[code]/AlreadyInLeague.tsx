"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type RouterOutputs } from "~/trpc/types";

type Props = {
  data: NonNullable<RouterOutputs["league"]["fromJoinCode"]>;
};

export function AlreadyInLeague({ data }: Props) {
  return (
    <div className="col-span-12 flex justify-center">
      <Card className="max-w-[400px]">
        <CardHeader>
          <CardTitle>You&apos;re already in the league</CardTitle>
          <CardDescription>
            You already registered for{" "}
            <span className="font-bold">{data.name}</span>. Did you mean to join
            another league?
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href={`/league/${data.league_id}`} className="w-full">
            <Button className="w-full">League Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

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

export function FuntimeWelcomeCard() {
  return (
    <Card className="max-w-[400px]">
      <CardHeader>
        <CardTitle>Welcome to Funtime</CardTitle>
        <CardDescription>
          Funtime is a free pick &apos;em league to play with your friends.
          Create an account to get started.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Link href="/login">
          <Button variant="secondary">Log In</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

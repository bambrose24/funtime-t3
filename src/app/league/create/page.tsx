"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

export default function CreateLeaguePage() {
  const [stepIdx, setStepIdx] = useState(0);

  const back = () => {
    setStepIdx((prev) => Math.max(0, prev - 1));
  };
  const next = () => {
    setStepIdx((prev) => prev + 1);
  };

  return (
    <div className="col-span-12 flex md:col-span-8 md:col-start-3">
      <Card className="w-full">
        <CardHeader className="flex w-full justify-center">
          Create a League
        </CardHeader>
        <CardContent>You&apos;re on step {stepIdx}</CardContent>
        <CardFooter className="flex w-full justify-between">
          {stepIdx > 0 ? (
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={next}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

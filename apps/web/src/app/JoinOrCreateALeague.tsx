"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function JoinOrCreateALeague() {
  const [code, setCode] = useState("");
  const router = useRouter();
  function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim();
    // Extract the code from pasted invite links; always navigate locally.
    const inviteCode = /\/join-league\/([^/?#]+)/.exec(value)?.[1] ?? value;
    if (inviteCode)
      router.push(`/join-league/${encodeURIComponent(inviteCode)}`);
  }
  return (
    <details className="mt-8">
      <summary className="w-fit cursor-pointer py-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        Have a league code?
      </summary>
      <form onSubmit={join} className="mt-2 max-w-sm">
        <label htmlFor="leagueCode" className="text-sm font-medium">
          League code or invite link
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="leagueCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            className="min-w-0"
            required
          />
          <Button type="submit" variant="outline" disabled={!code.trim()}>
            Join league
          </Button>
        </div>
      </form>
    </details>
  );
}

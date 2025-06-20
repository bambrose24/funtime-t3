"use client";
import { Defined } from "~/utils/defined";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "~/lib/utils";
import { useMemo } from "react";

export function MemberAvatar({
  name,
  photoURL,
  imageClassName,
  fallbackClassName,
}: {
  name: string;
  photoURL?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}) {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map((n) => n.at(0))
      .filter(Defined)
      .join("");
  }, [name]);
  return (
    <Avatar>
      <AvatarImage src={photoURL} className={cn("h-4 w-4", imageClassName)} />
      <AvatarFallback className={cn("h-4 w-4", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

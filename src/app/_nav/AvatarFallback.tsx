import { AvatarFallback } from "~/components/ui/avatar";

export function FuntimeAvatarFallback({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  return (
    <AvatarFallback className={className}>
      {username
        .split(" ")
        .slice(0, 2)
        .map((s) => s.at(0))}
    </AvatarFallback>
  );
}

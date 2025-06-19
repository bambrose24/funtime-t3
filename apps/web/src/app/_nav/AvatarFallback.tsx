import { AvatarFallback } from "~/components/ui/avatar";
import { capitalize } from "lodash";

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
        .map((s) => capitalize(s.at(0)))}
    </AvatarFallback>
  );
}

"use client";

import { clientApi } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/types";

type Props = {
  data: RouterOutputs["session"]["current"];
  children: React.ReactNode;
};

export function UserProviderClient({ children, data: initialData }: Props) {
  clientApi.session.current.useQuery(undefined, {
    initialData,
  });
  return <>{children}</>;
}

import { useRouter } from "next/navigation";
import { clientApi } from "~/trpc/react";

export function useUserEnforced(redirect = "/login") {
  const router = useRouter();
  const { data } = clientApi.session.current.useQuery();

  const { dbUser, supabaseUser } = data ?? {};
  if (!dbUser || !supabaseUser) {
    router.push(redirect);
    throw new Error("Could not find user");
  }
  return { dbUser, supabaseUser };
}

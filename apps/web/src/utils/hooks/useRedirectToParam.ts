import { useSearchParams } from "next/navigation";
import { z } from "zod";

export const redirectToSchema = z.object({
  redirectTo: z.string().nullable().optional(),
});

export function useRedirectToParam() {
  const searchParamsRaw = useSearchParams();
  const redirectToParam = redirectToSchema.safeParse({
    redirectTo: searchParamsRaw.get("redirectTo"),
  });
  return redirectToParam?.data?.redirectTo;
}

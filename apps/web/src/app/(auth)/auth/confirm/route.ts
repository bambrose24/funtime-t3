import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { redirect } from "next/navigation";
import { supabaseServer } from "~/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  console.log(
    `got search params in auth confirm route: ${searchParams.toString()}`,
  );

  const redirectTo = searchParams.get("redirectTo");
  const next =
    (searchParams.get("next") ?? type === "signup")
      ? `/confirm-signup?${redirectTo ? `redirectTo=${redirectTo}` : ``}`
      : (redirectTo ?? "/");

  if (token_hash && type) {
    const supabase = await supabaseServer();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}

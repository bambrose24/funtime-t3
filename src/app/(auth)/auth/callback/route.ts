import { supabaseServer } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  console.log("in auth callback GET");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log("code?", code);

  if (code) {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}

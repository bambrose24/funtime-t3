import { supabaseServer } from "~/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("in auth callback GET");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log("code?", code);

  if (code) {
    const supabase = supabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}

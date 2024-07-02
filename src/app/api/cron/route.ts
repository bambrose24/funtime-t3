import { supabaseServer } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import { run } from "~/cron";
import { getLogger } from "~/utils/logging";

export async function GET(request: Request) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = Date.now();
  getLogger().info(`[cron] Starting cron request handling`);
  await run();
  const end = Date.now();
  getLogger().info(
    `[cron] Cron finished in ${Math.round((end - now) / 1000)}s`,
  );
  return NextResponse.json({ ok: true });
}

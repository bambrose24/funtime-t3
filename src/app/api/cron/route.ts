import { supabaseServer } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import { run } from "~/cron";
import { getLogger } from "~/utils/logging";

export async function GET(request: Request) {
  const now = Date.now();
  getLogger().info(`[cron] Starting cron request handling`);
  await run();
  const end = Date.now();
  getLogger().info(
    `[cron] Cron finished in ${Math.round((end - now) / 1000)}s`,
  );
}

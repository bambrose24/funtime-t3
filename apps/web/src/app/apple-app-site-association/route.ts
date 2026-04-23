import { NextResponse } from "next/server";

const APPLINK_PATHS = [
  "/join-league/*",
  "/league/*",
  "/settings",
  "/admin",
  "/auth/callback*",
  "/login",
  "/signup",
];

const parseCsv = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

export async function GET() {
  const appIds = parseCsv(process.env.IOS_DEEPLINK_APP_IDS);
  const details = appIds.map((appID) => ({
    appID,
    paths: APPLINK_PATHS,
  }));

  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
